import { MenuItem } from '@ios/components';
import lightningIcon from '@ios/icons/lightning-01.svg';
import barChartIcon from '@ios/icons/bar-chart-square.svg';
import lineChartIcon from '@ios/icons/line-chart-up-01.svg';
import folderIcon from '@ios/icons/folder.svg';
import userIcon from '@ios/icons/user-profile-circle.svg';
import gearIcon from '@ios/icons/gear.svg';
import cardIcon from '@ios/icons/card.svg';
import helpIcon from '@ios/icons/help-circle-contained.svg';
import bugIcon from '@ios/icons/bug-icon.svg';
import computerIcon from '@ios/icons/computer.svg';
import logoutIcon from '@ios/icons/logout-02.svg';
import creditsIcon from '@ios/icons/credits.svg';

const T = {
  font:   'var(--ios-font)',
  light:  'var(--ios-light-100)',
  dark90: 'var(--ios-dark-90)',
  dark60: 'var(--ios-dark-60)',
  dark8:  'var(--ios-dark-8)',
  dark4:  'var(--ios-dark-4)',
  bg:     'var(--ios-background-gray)',
};

function CreditsButton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: 6, borderRadius: 99,
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      boxShadow: '0 0 32px rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32, padding: '0 6px' }}>
        <img src={creditsIcon} alt="" style={{ width: 16, height: 16 }} />
        <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark90, letterSpacing: '0.28px' }}>96</span>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span style={{
      fontFamily: T.font, fontSize: 18, fontWeight: 500, color: T.dark90,
      lineHeight: 1.4, padding: '0 4px 4px',
    }}>{children}</span>
  );
}

function ListGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: T.light, borderRadius: 16, border: `1px solid ${T.dark8}`,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {children}
    </div>
  );
}

export function MoreScreen({ onOpenLearningLoop }: { onOpenLearningLoop: () => void }) {
  return (
    <div style={{ background: T.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 20px 12px', flexShrink: 0,
      }}>
        <span style={{ fontFamily: T.font, fontSize: 28, fontWeight: 400, color: T.dark90, lineHeight: 1.1 }}>More</span>
        <CreditsButton />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: '8px 20px 140px' }}>
        {/* Group 1: Workspace */}
        <ListGroup>
          <MenuItem type="action" title="Integrations" leadingIcon={lightningIcon} leadingIconBox separator />
          <MenuItem type="action" title="Insights"     leadingIcon={barChartIcon}  leadingIconBox separator />
          <MenuItem type="action" title="Learning Loop" leadingIcon={lineChartIcon} leadingIconBox separator onClick={onOpenLearningLoop} />
          <MenuItem type="action" title="My Files"     leadingIcon={folderIcon}    leadingIconBox />
        </ListGroup>

        {/* Group 2: Account */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>Account</SectionLabel>
          <ListGroup>
            <MenuItem type="action" title="Adam Nathan" detail="adam@blaze.ai" leadingIcon={userIcon} leadingIconBox separator />
            <MenuItem type="action" title="Settings" leadingIcon={gearIcon} leadingIconBox separator />
            <MenuItem type="action" title="Billing"  leadingIcon={cardIcon} leadingIconBox />
          </ListGroup>
        </div>

        {/* Group 3: Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>Support</SectionLabel>
          <ListGroup>
            <MenuItem type="action" title="Help"             leadingIcon={helpIcon}     leadingIconBox separator />
            <MenuItem type="action" title="Report a Bug"     leadingIcon={bugIcon}      leadingIconBox separator />
            <MenuItem type="action" title="Show Web Version" leadingIcon={computerIcon} leadingIconBox />
          </ListGroup>
        </div>

        {/* Group 4: Sign out */}
        <ListGroup>
          <MenuItem type="action" title="Sign Out" leadingIcon={logoutIcon} leadingIconBox />
        </ListGroup>
      </div>
    </div>
  );
}
