import type { ReactNode } from 'react';
import { StatusBar } from './StatusBar';

export interface PhoneFrameProps {
  /** Main scrollable screen content. */
  children: ReactNode;
  /**
   * Optional slot for elements that should sit outside the scroll area and
   * be absolutely positioned within the phone frame — e.g. a tab bar or FAB.
   * Rendered as a direct child of the frame (position: relative context).
   */
  footer?: ReactNode;
  /**
   * Optional full-screen overlay rendered above everything else in the frame
   * (above footer/tab bar). Use for modals, sheets, drawers.
   */
  overlay?: ReactNode;
}

/**
 * iOS phone frame shell. Renders a 402×874 iPhone bezel with a status bar and
 * a scrollable content area. Pass a tab bar (or any bottom chrome) via `footer`
 * — it will be absolutely positioned relative to the frame, not scroll with content.
 *
 * Usage:
 *   <PhoneFrame footer={<MyTabBar />}>
 *     <HomeScreen />
 *     <div style={{ height: 100 }} />  // spacer so content clears the tab bar
 *   </PhoneFrame>
 */
export function PhoneFrame({ children, footer, overlay }: PhoneFrameProps) {
  return (
    <div style={{
      width: 402,
      height: 874,
      background: 'var(--ios-background-gray)',
      borderRadius: 62,
      boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar theme="dark" />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        {children}
      </div>
      {footer}
      {overlay}
    </div>
  );
}
