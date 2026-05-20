import { useState, type ComponentType, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { Avatar, useToast } from '@/staging';
import type { IconProps } from '@/icons/Types';
import Plus from '@/icons/20/Plus';
import Stars from '@/icons/20/Stars';
import Document from '@/icons/20/Document';
import Facebook from '@/icons/20/Facebook';
import ChevronDown from '@/icons/20/ChevronDown';
import ArrowDown from '@/icons/20/ArrowDown';
import Trash2 from '@/icons/20/Trash2';
import LinkExternal from '@/icons/20/LinkExternal';

/**
 * Source Materials tab — list of brand inputs Blaze has indexed (social
 * accounts, web pages, uploaded PDFs/docs). Top: "Add Source Material"
 * primary action. Body: a header row + table rows with hover actions
 * (Trash + Open) on URL-bearing rows.
 */

type RowIcon =
  | { kind: 'avatar'; src?: string; fallback: string; channel?: ComponentType<IconProps> }
  | { kind: 'logo' }
  | { kind: 'pdf' }
  | { kind: 'md' }
  | { kind: 'doc' };

interface SourceRow {
  id: string;
  icon: RowIcon;
  name: string;
  /** Secondary URL displayed beneath the name. */
  url?: string;
  /** Plain-text type label (renders as text). */
  type?: string;
  /** Dropdown-type label (renders as a chevron-dropdown). */
  typeDropdown?: string;
  lastScanned: string;
  added: string;
}

const ROWS: SourceRow[] = [
  {
    id: '1',
    icon: { kind: 'avatar', src: 'https://i.pravatar.cc/80?img=12', fallback: 'AN', channel: Facebook },
    name: 'Adam Nathan',
    type: 'Social account',
    lastScanned: 'Nov 24 2025',
    added: 'Nov 24 2025',
  },
  {
    id: '2',
    icon: { kind: 'logo' },
    name: 'Home - Radiant Health',
    url: 'https://getradiant.org/',
    type: 'Webpage',
    lastScanned: 'Nov 19, 2025',
    added: 'Nov 19, 2025',
  },
  {
    id: '3',
    icon: { kind: 'logo' },
    name: 'About - Radiant Health',
    url: 'https://getradiant.org/ab...',
    type: 'Webpage',
    lastScanned: 'Nov 14, 2025',
    added: 'Sep 26, 2025',
  },
  {
    id: '4',
    icon: { kind: 'logo' },
    name: 'Individualized Care - Radiant Health',
    url: 'https://getradiant.org/individ...',
    type: 'Webpage',
    lastScanned: 'Nov 14, 2025',
    added: 'Sep 22, 2025',
  },
  {
    id: '5',
    icon: { kind: 'doc' },
    name: 'File name goes here long file name would look like this and truncate...',
    typeDropdown: 'Blog',
    lastScanned: 'Sep 18, 2025',
    added: 'Sep 18, 2025',
  },
  {
    id: '6',
    icon: { kind: 'pdf' },
    name: 'Radiant Health Brochure',
    typeDropdown: 'Other',
    lastScanned: 'Sep 18, 2025',
    added: 'Sep 17, 2025',
  },
  {
    id: '7',
    icon: { kind: 'doc' },
    name: 'Brand Strategy',
    typeDropdown: 'Document',
    lastScanned: 'Nov 14, 2025',
    added: 'Sep 16, 2025',
  },
  {
    id: '8',
    icon: { kind: 'md' },
    name: 'File name goes here',
    typeDropdown: 'Blog',
    lastScanned: 'Aug 14, 2025',
    added: 'Aug 14, 2025',
  },
];

export function SourceMaterials() {
  const { showToast } = useToast();

  return (
    <div>
      {/* section: header row with primary action */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--dark-8)' }}>
        <div style={{ maxWidth: 640 }}>
          <Heading level={4} style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>
            Help Blaze learn about your brand
          </Heading>
          <Text variant="secondary" style={{ display: 'block', marginTop: 4, fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5 }}>
            Upload marketing or brand materials (brochures, one-pagers, videos, press coverage, etc.).
            Blaze will analyze them and pull them into your content.
          </Text>
        </div>
        <Button variant="primary" size="md" frontIcon={Plus} onPress={() => showToast({ message: 'Add Source Material coming soon' })}>
          Add Source Material
        </Button>
      </div>

      {/* section: items count */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 24, marginBottom: 12 }}>
        <Heading level={3} style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Source materials</Heading>
        <Text variant="secondary" style={{ fontSize: 13, color: 'var(--dark-60)' }}>45 items</Text>
      </div>

      {/* section: table */}
      <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
        <HeaderRow />
        {ROWS.map((row, i) => (
          <Row key={row.id} row={row} isLast={i === ROWS.length - 1} />
        ))}
      </div>
    </div>
  );
}

const GRID_COLUMNS = 'minmax(0, 2.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)';

function HeaderRow() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: GRID_COLUMNS,
        gap: 20,
        padding: '10px 20px',
        borderBottom: '1px solid var(--dark-8)',
        fontSize: 12,
        color: 'var(--dark-60)',
      }}
    >
      <span>Name</span>
      <span>Type</span>
      <span>Last Scanned</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        Added
        <ArrowDown size={12} color="var(--dark-60)" />
      </span>
    </div>
  );
}

function Row({ row, isLast }: { row: SourceRow; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  const { showToast } = useToast();
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: GRID_COLUMNS,
        gap: 20,
        padding: '12px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        background: hovered ? 'var(--dark-2)' : 'var(--light-100)',
        position: 'relative',
        transition: 'background 80ms ease',
      }}
    >
      {/* Name column */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <RowIconGlyph icon={row.icon} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--dark-90)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.name}
          </Text>
          {row.url && (
            <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.url}
            </Text>
          )}
        </div>
      </div>

      {/* Type column */}
      <div style={{ minWidth: 0 }}>
        {row.typeDropdown ? (
          <button
            type="button"
            onClick={() => showToast({ message: 'Change type coming soon' })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid var(--dark-8)',
              cursor: 'pointer',
              color: 'var(--dark-90)',
              fontSize: 12,
              fontWeight: 400,
              fontFamily: 'inherit',
            }}
          >
            {row.typeDropdown}
            <ChevronDown size={12} color="var(--dark-60)" />
          </button>
        ) : (
          <Text style={{ fontSize: 13, color: 'var(--dark-90)' }}>{row.type}</Text>
        )}
      </div>

      <Text style={{ fontSize: 13, color: 'var(--dark-90)' }}>{row.lastScanned}</Text>
      <Text style={{ fontSize: 13, color: 'var(--dark-90)' }}>{row.added}</Text>

      {/* Hover actions overlay — anchored to the row's right edge. */}
      {hovered && row.url && <HoverActions onOpen={() => showToast({ message: 'Open link coming soon' })} onDelete={() => showToast({ message: 'Delete row coming soon' })} />}
    </div>
  );
}

function HoverActions({ onOpen, onDelete }: { onOpen: () => void; onDelete: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        right: 20,
        transform: 'translateY(-50%)',
        display: 'inline-flex',
        gap: 6,
        background: 'var(--light-100)',
        padding: 4,
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <button
        type="button"
        aria-label="Delete"
        onClick={onDelete}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--dark-90)',
        }}
      >
        <Trash2 size={14} color="currentColor" />
      </button>
      <button
        type="button"
        onClick={onOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 28,
          padding: '0 10px',
          borderRadius: 6,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          cursor: 'pointer',
          color: 'var(--dark-90)',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'inherit',
        }}
      >
        <LinkExternal size={14} color="currentColor" />
        Open
      </button>
    </div>
  );
}

function RowIconGlyph({ icon }: { icon: RowIcon }) {
  if (icon.kind === 'avatar') {
    return (
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar size={32} src={icon.src} fallback={icon.fallback} />
        {icon.channel && (
          <span
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: 999,
              background: 'var(--light-100)',
              border: '1.5px solid var(--light-100)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 1px var(--dark-8)',
            }}
          >
            <icon.channel size={10} color="var(--dark-80)" />
          </span>
        )}
      </div>
    );
  }
  if (icon.kind === 'logo') {
    return (
      <span
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: 'var(--purple)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--light-100)',
          flexShrink: 0,
        }}
      >
        <Stars size={16} color="var(--light-100)" />
      </span>
    );
  }
  if (icon.kind === 'pdf') {
    return (
      <FormatBadge bg="var(--red-90)" label="PDF" />
    );
  }
  if (icon.kind === 'md') {
    return (
      <FormatBadge bg="var(--status-approved)" label="MD" />
    );
  }
  // Generic document glyph.
  return (
    <span
      aria-hidden
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        background: 'var(--dark-4)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--dark-60)',
        flexShrink: 0,
      }}
    >
      <Document size={18} color="currentColor" />
    </span>
  );
}

function FormatBadge({ bg, label }: { bg: string; label: ReactNode }) {
  return (
    <span
      aria-hidden
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        background: bg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--light-100)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.3px',
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}
