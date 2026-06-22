import { useState, useEffect, useRef } from 'react';
import { ToolbarButton } from '@ios/components';
import chevronRightSmall from '@ios/icons/chevron-right-small.svg';
import campaignsIcon from '@ios/icons/layers-05.svg';
import brandKitIcon from '@ios/icons/atom.svg';
import lightningIcon from '@ios/icons/lightning-01.svg';
import folderIcon from '@ios/icons/folder.svg';
import barGroupIcon from '@ios/icons/bar-group-03.svg';
import learningLoopIcon from '@ios/icons/arrow-up-right-square-contained.svg';
import paidAdsIcon from '@ios/icons/currency-dollar.svg';
import seoIcon from '@ios/icons/copy.svg';
import userProfileIcon from '@ios/icons/user-profile-circle.svg';
import settingsIcon from '@ios/icons/settings.svg';
import cardIcon from '@ios/icons/card.svg';
import helpIcon from '@ios/icons/help-circle-contained.svg';
import bugIcon from '@ios/icons/Bug.svg';
import layoutIcon from '@ios/icons/layout-01.svg';
import logoutIcon from '@ios/icons/logout-02.svg';

const font = 'var(--ios-font)';

const CARD_STYLE: React.CSSProperties = {
  background: 'white',
  borderRadius: 24,
  overflow: 'hidden',
};

function SectionGroup({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {label && (
        <div style={{ paddingLeft: 16 }}>
          <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, lineHeight: '22.4px', color: 'var(--ios-dark-90)' }}>{label}</span>
        </div>
      )}
      <div style={CARD_STYLE}>{children}</div>
    </div>
  );
}

function Row({
  icon, label, rightDetail, separator = false, onClick,
}: {
  icon: string; label: string; rightDetail?: string; separator?: boolean; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 20px', height: 52,
      borderBottom: separator ? '1px solid var(--ios-dark-4)' : 'none',
      cursor: 'pointer', boxSizing: 'border-box',
    }}>
      <img src={icon} alt="" aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0 }} />
      <span style={{ flex: 1, fontFamily: font, fontSize: 16, fontWeight: 400, lineHeight: 1.5, color: 'var(--ios-dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {rightDetail && (
        <span style={{ fontFamily: font, fontSize: 12, fontWeight: 400, color: 'var(--ios-dark-60)', letterSpacing: '0.12px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {rightDetail}
        </span>
      )}
      <img src={chevronRightSmall} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.25, flexShrink: 0 }} />
    </div>
  );
}

export function MoreScreen({
  onBrandKitClick,
  onOpenLearningLoop = () => {},
  onCampaignsClick,
}: {
  onBrandKitClick?: () => void;
  onOpenLearningLoop?: () => void;
  onCampaignsClick?: () => void;
} = {}) {
  // Show the bottom divider on the sticky header only once the user has
  // scrolled past it (iOS Large Title behavior). We listen to scroll on the
  // PhoneFrame's inner scroll container — IntersectionObserver wouldn't
  // work here because its default root is the document viewport, but the
  // actual scroll happens inside a nested div within the phone frame.
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let el: HTMLElement | null = rootRef.current;
    while (el && el !== document.body) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') break;
      el = el.parentElement;
    }
    if (!el || el === document.body) return;
    const handler = () => setScrolled((el as HTMLElement).scrollTop > 0);
    handler();
    el.addEventListener('scroll', handler, { passive: true });
    return () => el!.removeEventListener('scroll', handler);
  }, []);

  return (
    <div ref={rootRef} style={{ fontFamily: font, background: '#f8f8f9', minHeight: '100%', paddingBottom: 16 }}>

      {/* Custom sticky header — mirrors ToolbarHeader variant="screen" layout
          but with a scroll-aware bottom border (the lib component's border
          is always-on). */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
        height: 68,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 20px 12px',
        boxSizing: 'border-box',
        background: 'rgba(247,247,247,0.85)',
        backdropFilter: 'saturate(140%) blur(20px)',
        WebkitBackdropFilter: 'saturate(140%) blur(20px)',
        borderBottom: scrolled ? '1px solid var(--ios-dark-4)' : '1px solid transparent',
        transition: 'border-color 120ms ease-out',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{
            flex: 1,
            fontFamily: font,
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.4,
            color: 'var(--ios-dark-90)',
            minWidth: 0,
          }}>
            More
          </span>
          <ToolbarButton variant="credits" credits={96} />
        </div>
      </div>

      {/* scrollable content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 20px' }}>

        {/* tools — no section label */}
        <div style={CARD_STYLE}>
          <Row icon={campaignsIcon}    label="Campaigns"     separator onClick={onCampaignsClick} />
          <Row icon={brandKitIcon}     label="Brand Kit"     separator onClick={onBrandKitClick} />
          <Row icon={lightningIcon}    label="Integrations"  separator />
          <Row icon={barGroupIcon}     label="Insights"      separator />
          <Row icon={learningLoopIcon} label="Learning Loop" separator onClick={onOpenLearningLoop} />
          <Row icon={folderIcon}       label="My Files" />
        </div>

        {/* reach */}
        <SectionGroup label="Reach">
          <Row icon={paidAdsIcon} label="Paid Ads" separator />
          <Row icon={seoIcon}     label="SEO" />
        </SectionGroup>

        {/* account */}
        <SectionGroup label="Account">
          <Row icon={userProfileIcon} label="Adam Nathan" rightDetail="adam@blaze.ai" separator />
          <Row icon={settingsIcon}    label="Settings"    separator />
          <Row icon={cardIcon}        label="Billing" />
        </SectionGroup>

        {/* support */}
        <SectionGroup label="Support">
          <Row icon={helpIcon}   label="Help"             separator />
          <Row icon={bugIcon}    label="Report a Bug"     separator />
          <Row icon={layoutIcon} label="Show Web Version" />
        </SectionGroup>

        {/* sign out */}
        <div style={CARD_STYLE}>
          <Row icon={logoutIcon} label="Sign Out" />
        </div>

        {/* version */}
        <div style={{ paddingLeft: 16 }}>
          <span style={{ fontFamily: font, fontSize: 14, fontWeight: 400, lineHeight: 1.4, color: 'var(--ios-dark-60)', letterSpacing: '0.14px' }}>
            App Version: 2.4.0 (164)
          </span>
        </div>

      </div>
    </div>
  );
}
