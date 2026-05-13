/**
 * MenuItem — iOS list row component.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 5028:17300
 *
 * 362px wide, 52px tall (most variants). Optional bottom separator.
 *
 * Types:
 *   toggle     — title + Toggle trailing
 *   detail     — title + detail text + chevron
 *   action     — leading icon + title + optional detail + chevron
 *   url        — avatar + url text + edit icon + chevron
 *   image-list — 64×64 thumbnail + title + subtitle + optional Radio
 */

import { Toggle } from './Toggle';
import { Radio } from './Radio';

export type MenuItemType = 'toggle' | 'detail' | 'action' | 'url' | 'image-list';

export interface MenuItemProps {
  type?: MenuItemType;
  title: string;
  detail?: string;
  subtitle?: string;
  leadingIcon?: string;
  /** Wraps leading icon in a 36×36 dark-4 background box (MoreScreen / settings style). */
  leadingIconBox?: boolean;
  thumbnail?: string;
  avatarSrc?: string;
  toggled?: boolean;
  selected?: boolean;
  separator?: boolean;
  /** Small badge pill shown at trailing edge before chevron (e.g. "New"). */
  badge?: string;
  onToggle?: (on: boolean) => void;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  destructive?: boolean;
}

function ChevronRight({ color = 'var(--ios-dark-25)' }: { color?: string }) {
  return (
    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M1 1l6 5.5L1 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuItem({
  type = 'action',
  title,
  detail,
  subtitle,
  leadingIcon,
  leadingIconBox = false,
  thumbnail,
  avatarSrc,
  toggled = false,
  selected = false,
  separator = false,
  badge,
  onToggle,
  onSelect,
  onClick,
  destructive = false,
}: MenuItemProps) {
  const titleColor = destructive ? '#ae2222' : 'var(--ios-dark-90)';
  const isImageList = type === 'image-list';
  const rowHeight = isImageList ? 80 : 52;

  return (
    <div
      style={{
        width: '100%',
        minHeight: rowHeight,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        gap: 12,
        boxSizing: 'border-box',
        borderBottom: separator ? '1px solid var(--ios-dark-4)' : undefined,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {/* Leading icon or thumbnail */}
      {type === 'action' && leadingIcon && (
        leadingIconBox ? (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ios-dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={leadingIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20, opacity: destructive ? 0.7 : 0.7 }} />
          </div>
        ) : (
          <img src={leadingIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0, opacity: destructive ? 0.8 : 1 }} />
        )
      )}

      {type === 'url' && avatarSrc && (
        <img
          src={avatarSrc}
          alt=""
          style={{ width: 32, height: 32, borderRadius: 99, flexShrink: 0, objectFit: 'cover' }}
        />
      )}

      {isImageList && thumbnail && (
        <img
          src={thumbnail}
          alt=""
          style={{ width: 64, height: 64, borderRadius: 8, flexShrink: 0, objectFit: 'cover' }}
        />
      )}

      {/* Title + detail stack */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'var(--ios-font)',
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.5,
            color: titleColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
        {(detail || subtitle) && (
          <span
            style={{
              fontFamily: 'var(--ios-font)',
              fontSize: 13,
              fontWeight: 400,
              lineHeight: 1.4,
              color: 'var(--ios-dark-60)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {detail ?? subtitle}
          </span>
        )}
      </div>

      {/* Trailing controls */}
      {type === 'toggle' && (
        <Toggle on={toggled} onChange={onToggle} />
      )}

      {(type === 'detail' || type === 'action') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {detail && type === 'detail' && (
            <span
              style={{
                fontFamily: 'var(--ios-font)',
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--ios-dark-40)',
                whiteSpace: 'nowrap',
              }}
            >
              {detail}
            </span>
          )}
          {badge && (
            <span style={{
              background: 'var(--ios-accent)',
              color: 'var(--ios-light-100)',
              fontFamily: 'var(--ios-font)',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 99,
              padding: '2px 7px',
              whiteSpace: 'nowrap',
            }}>
              {badge}
            </span>
          )}
          <ChevronRight />
        </div>
      )}

      {type === 'url' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M10 2L12 4 5.5 10.5 2 11.5 3 8 9.5 1.5l.5.5z" stroke="var(--ios-dark-40)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <ChevronRight />
        </div>
      )}

      {isImageList && (
        <Radio selected={selected} onChange={onSelect} />
      )}
    </div>
  );
}
