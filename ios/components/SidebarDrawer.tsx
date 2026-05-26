/**
 * SidebarDrawer — workspace switcher panel.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 5425:84801
 *
 * Slides in from the left edge of the PhoneFrame when the user taps the
 * workspace logo on the Home screen. 342px wide, rounded right corners (r38).
 * White surface + drawer shadow 0 15px 37.5px rgba(0,0,0,0.18).
 *
 * Two groups of workspace rows:
 *   "My workspaces"        — owned workspaces; active one shows a "Current" pill
 *   "Workspaces I'm part of" — role = "member" | "guest" pill + chevron
 *
 * Usage (inside PhoneFrame, as a sibling to the scrollable content area):
 *   <SidebarDrawer
 *     visible={open}
 *     onClose={() => setOpen(false)}
 *     myWorkspaces={[...]}
 *     memberWorkspaces={[...]}
 *     onWorkspaceSelect={(id) => { ... }}
 *     onAddWorkspace={() => { ... }}
 *   />
 */

import { useEffect, useState } from 'react';
import { ToolbarButton } from './ToolbarButton';
import chevronRightIcon from '@ios/icons/chevron-right-small.svg';

export interface WorkspaceItem {
  id: string;
  name: string;
  /** Plan / tier label shown below the workspace name. */
  plan: string;
  /** Image src for the avatar circle. Falls back to a colored initial circle. */
  avatarSrc?: string;
  /** Background color of the avatar circle (used when no avatarSrc provided). */
  avatarBg?: string;
  /** Role tag shown on rows in the "Workspaces I'm part of" section. */
  role?: 'member' | 'guest';
  /** Whether this is the currently active workspace (shows "Current" pill). */
  isCurrent?: boolean;
}

export interface SidebarDrawerProps {
  visible: boolean;
  onClose?: () => void;
  myWorkspaces?: WorkspaceItem[];
  memberWorkspaces?: WorkspaceItem[];
  onWorkspaceSelect?: (id: string) => void;
  onAddWorkspace?: () => void;
}

const DRAWER_WIDTH = 342;

function WorkspaceAvatar({ item }: { item: WorkspaceItem }) {
  const initial = item.name.charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 37,
        background: item.avatarBg ?? 'var(--ios-dark-8)',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {item.avatarSrc ? (
        <img
          src={item.avatarSrc}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <span
          style={{
            fontFamily: 'var(--ios-font)',
            fontSize: 13,
            fontWeight: 500,
            color: '#ffffff',
            lineHeight: 1,
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

function RolePill({ label }: { label: string }) {
  return (
    <div
      style={{
        height: 22,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 6,
        paddingRight: 6,
        borderRadius: 99,
        background: 'rgba(0,0,0,0.03)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--ios-font)',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.39,
          letterSpacing: '0.36px',
          color: 'var(--ios-dark-90)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function WorkspaceRow({
  item,
  showChevron = false,
  separator = true,
  onClick,
}: {
  item: WorkspaceItem;
  showChevron?: boolean;
  separator?: boolean;
  onClick?: () => void;
}) {
  const pillLabel = item.isCurrent
    ? 'Current'
    : item.role
    ? item.role.charAt(0).toUpperCase() + item.role.slice(1)
    : null;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottom: separator ? '1px solid var(--ios-dark-4)' : 'none',
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <WorkspaceAvatar item={item} />

      {/* name + plan */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--ios-font)',
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.5,
            color: 'var(--ios-dark-80)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
        </span>
        <span
          style={{
            fontFamily: 'var(--ios-font)',
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: '0.12px',
            color: 'var(--ios-dark-60)',
          }}
        >
          {item.plan}
        </span>
      </div>

      {/* trailing: pill + optional chevron */}
      {pillLabel && <RolePill label={pillLabel} />}
      {showChevron && (
        <img
          src={chevronRightIcon}
          alt=""
          aria-hidden="true"
          style={{ width: 20, height: 20, opacity: 0.25, flexShrink: 0 }}
        />
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--ios-font)',
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: '0.12px',
        color: 'var(--ios-dark-60)',
        display: 'block',
        marginBottom: 0,
      }}
    >
      {label}
    </span>
  );
}

export function SidebarDrawer({
  visible,
  onClose,
  myWorkspaces = [],
  memberWorkspaces = [],
  onWorkspaceSelect,
  onAddWorkspace,
}: SidebarDrawerProps) {
  const [show, setShow] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setEntered(false);
      const t = setTimeout(() => setShow(false), 280);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.18)',
          zIndex: 60,
          opacity: entered ? 1 : 0,
          transition: 'opacity 0.28s ease',
        }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Workspaces"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          background: 'var(--ios-background-light)',
          borderTopRightRadius: 38,
          borderBottomRightRadius: 38,
          boxShadow: '0 15px 37.5px rgba(0,0,0,0.18)',
          zIndex: 61,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: 60,
          boxSizing: 'border-box',
          transform: entered ? 'translateX(0)' : `translateX(-${DRAWER_WIDTH}px)`,
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 20,
            paddingRight: 20,
            height: 44,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--ios-font)',
              fontSize: 'var(--ios-h3-size)',
              fontWeight: 400,
              lineHeight: 'var(--ios-h3-lh)',
              color: 'var(--ios-dark-90)',
              flex: 1,
            }}
          >
            Workspaces
          </span>
          <ToolbarButton variant="add" onClick={onAddWorkspace} aria-label="Add workspace" />
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>

          {/* My workspaces */}
          {myWorkspaces.length > 0 && (
            <div style={{ paddingLeft: 20, paddingRight: 20 }}>
              <SectionLabel label="My workspaces" />
              {myWorkspaces.map((ws, i) => (
                <WorkspaceRow
                  key={ws.id}
                  item={ws}
                  showChevron={!ws.isCurrent}
                  separator={i < myWorkspaces.length - 1}
                  onClick={() => onWorkspaceSelect?.(ws.id)}
                />
              ))}
            </div>
          )}

          {/* Workspaces I'm part of */}
          {memberWorkspaces.length > 0 && (
            <div style={{ paddingLeft: 20, paddingRight: 20 }}>
              <SectionLabel label="Workspaces I'm part of" />
              {memberWorkspaces.map((ws, i) => (
                <WorkspaceRow
                  key={ws.id}
                  item={ws}
                  showChevron
                  separator={i < memberWorkspaces.length - 1}
                  onClick={() => onWorkspaceSelect?.(ws.id)}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
