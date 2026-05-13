/**
 * TabBar — iOS tab navigation capsule.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 5098:22054 / 6957:177696
 * Spec:  ios/design.md §3.1
 *
 * Renders a frosted-glass pill with N equal-width tab items.
 * Each item shows a 24 px icon + 10 px label; the active item gets a
 * Dark-4 background pill. When showGradient is true (default) the capsule
 * sits inside a 126 px absolute container whose top edge fades to
 * transparent, masking content scrolling behind the bar.
 *
 * Pass `floatingButton` to render a dark floating action button above the
 * tab bar (positioned at bottom: 107px, right: 24px relative to the container).
 *
 * Usage inside a PhoneFrame footer slot:
 *   const tabs: TabItem[] = [
 *     { id: 'home', label: 'Home', icon: homeIcon, iconActive: homeFilledIcon },
 *     { id: 'calendar', label: 'Calendar', icon: calendarIcon },
 *     ...
 *   ];
 *   <PhoneFrame footer={
 *     <TabBar tabs={tabs} activeTab={active} onTabChange={setActive}
 *       floatingButton={{ icon: plusIcon, label: 'New', onClick: handleNew }} />
 *   }>
 */

import type { CSSProperties } from 'react';
import { TabBarItem } from './TabBarItem';

export interface TabItem {
  /** Unique identifier — used as the value passed to onTabChange. */
  id: string;
  /** Label rendered below the icon. */
  label: string;
  /** SVG URL for the default (inactive) state. Import with `import icon from '@ios/icons/foo.svg'`. */
  icon: string;
  /**
   * SVG URL for the active state. Falls back to `icon` when omitted.
   * Provide a filled variant when one exists (e.g. home-filled, brandkit_filled).
   */
  iconActive?: string;
}

export interface FloatingButtonProps {
  /** SVG URL for the button icon. */
  icon: string;
  /** Accessible label for the button. */
  label?: string;
  onClick?: () => void;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  /**
   * When true (default), wraps the capsule in an absolutely-positioned
   * 126 px container with a top-edge gradient that fades scrollable
   * content behind the bar. Set to false when you need to position
   * the capsule yourself.
   */
  showGradient?: boolean;
  /**
   * When provided, renders a floating dark pill button above the tab bar.
   * Positioned at bottom: 107px, right: 24px within the gradient container.
   * Requires showGradient=true (default).
   */
  floatingButton?: FloatingButtonProps;
}

const CAPSULE_STYLE: CSSProperties = {
  display: 'flex',
  background: 'var(--ios-tab-bar-bg)',
  backdropFilter: 'var(--ios-glass-blur)',
  WebkitBackdropFilter: 'var(--ios-glass-blur)',
  // Blaze glass effect: DROP_SHADOW 0 0 32px #00000014 + subtle inner ring
  boxShadow: 'var(--ios-glass-shadow), inset 0 0 0 0.5px var(--ios-dark-8)',
  borderRadius: 99,
  padding: 4,
};

export function TabBar({ tabs, activeTab, onTabChange, showGradient = true, floatingButton }: TabBarProps) {
  const capsule = (
    <div style={CAPSULE_STYLE} role="tablist">
      {tabs.map((tab) => (
        <TabBarItem
          key={tab.id}
          id={tab.id}
          label={tab.label}
          icon={tab.icon}
          iconActive={tab.iconActive}
          selected={tab.id === activeTab}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  );

  if (!showGradient) return capsule;

  return (
    // Matches Figma outer container: 126 px tall, gradient fade from background-gray transparent
    // to opaque so content scrolls cleanly under the tab bar (design.md §2.5).
    // pointerEvents on the gradient area are none so it doesn't eat scroll gestures.
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 126,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 14px 12px',
        background: 'linear-gradient(to bottom, rgba(247,247,247,0), var(--ios-background-gray) 60%)',
        pointerEvents: 'none',
      }}
    >
      {/* Floating action button — dark pill, bottom: 107px, right: 24px */}
      {floatingButton && (
        <button
          type="button"
          aria-label={floatingButton.label}
          onClick={floatingButton.onClick}
          style={{
            position: 'absolute',
            bottom: 107,
            right: 24,
            background: 'rgba(0,0,0,0.9)',
            borderRadius: 99,
            padding: 4,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 32px rgba(0,0,0,0.08)',
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{
            width: 55,
            height: 55,
            borderRadius: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img src={floatingButton.icon} alt="" aria-hidden="true" style={{ width: 24, height: 24, filter: 'invert(1)' }} />
          </div>
        </button>
      )}
      {/* Restore pointer events on the interactive capsule itself */}
      <div style={{ pointerEvents: 'all' }}>{capsule}</div>
    </div>
  );
}
