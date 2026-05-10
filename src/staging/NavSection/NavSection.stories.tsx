import type { Story, StoryDefault } from '@ladle/react';
import { NavSection } from './NavSection';
import { NavItem } from '../NavItem';

export default { title: 'Components / NavSection' } as StoryDefault;

export const Default: Story = () => (
  <div style={{ width: 220, padding: 12, background: 'var(--default-bg)' }}>
    <NavSection label="Demand Gen">
      <NavItem>
        <NavItem.Label label="Organic Social" />
      </NavItem>
      <NavItem>
        <NavItem.Label label="SEO/AEO" />
      </NavItem>
      <NavItem>
        <NavItem.Label label="Map Ranking" />
      </NavItem>
    </NavSection>
  </div>
);

export const WithMultipleItems: Story = () => (
  <div style={{ width: 220, padding: 12, background: 'var(--default-bg)' }}>
    <NavSection label="Demand Gen">
      <NavItem>
        <NavItem.Label label="Organic Social" />
      </NavItem>
      <NavItem>
        <NavItem.Label label="SEO/AEO" />
      </NavItem>
      <NavItem>
        <NavItem.Label label="Map Ranking" />
      </NavItem>
    </NavSection>
    <NavSection label="Conversion">
      <NavItem>
        <NavItem.Label label="Landing Pages" />
      </NavItem>
      <NavItem>
        <NavItem.Label label="Reputation" />
      </NavItem>
    </NavSection>
    <NavSection label="Settings">
      <NavItem>
        <NavItem.Label label="Content Settings" />
      </NavItem>
      <NavItem>
        <NavItem.Label label="Brand Kit" />
      </NavItem>
    </NavSection>
  </div>
);

export const WithoutLabel: Story = () => (
  <div style={{ width: 220, padding: 12, background: 'var(--default-bg)' }}>
    <NavSection>
      <NavItem>
        <NavItem.Label label="Home" />
      </NavItem>
    </NavSection>
  </div>
);

export const Collapsible: Story = () => (
  <div style={{ width: 220, padding: 12, background: 'var(--default-bg)' }}>
    <NavSection label="Reach" collapsible>
      <NavItem>
        <NavItem.Label label="Organic Social" />
      </NavItem>
      <NavItem>
        <NavItem.Label label="SEO/AEO" />
      </NavItem>
    </NavSection>
  </div>
);
