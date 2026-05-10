import type { Story, StoryDefault } from '@ladle/react';
import { NavItem } from './NavItem';
import Home from '../../icons/20/Home';
import HomeFilled from '../../icons/20/HomeFilled';

export default { title: 'Components / NavItem' } as StoryDefault;

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  width: 240,
};

export const Default: Story = () => (
  <div style={wrapperStyle}>
    <NavItem>
      <NavItem.Label label="Home" />
    </NavItem>
  </div>
);

export const Active: Story = () => (
  <div style={wrapperStyle}>
    <NavItem isActive>
      <NavItem.Label label="Home" />
    </NavItem>
  </div>
);

export const WithIcon: Story = () => (
  <div style={wrapperStyle}>
    <NavItem>
      <Home size={18} />
      <NavItem.Label label="Home" />
    </NavItem>
    <NavItem isActive>
      <HomeFilled size={18} />
      <NavItem.Label label="Home" />
    </NavItem>
  </div>
);

export const WithCounter: Story = () => (
  <div style={wrapperStyle}>
    <NavItem>
      <Home size={18} />
      <NavItem.Label label="Integrations" />
      <NavItem.Counter total={3} />
    </NavItem>
  </div>
);

export const AllSizes: Story = () => (
  <div style={wrapperStyle}>
    <NavItem size="lg">
      <Home size={18} />
      <NavItem.Label label="Large" />
    </NavItem>
    <NavItem size="md">
      <Home size={18} />
      <NavItem.Label label="Medium" />
    </NavItem>
    <NavItem size="sm">
      <Home size={16} />
      <NavItem.Label label="Small" />
    </NavItem>
  </div>
);
