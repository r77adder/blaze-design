import type { Story, StoryDefault } from '@ladle/react';
import { Pill } from './Pill';
import type { PillSize } from './Types';
import Home from '../../icons/20/Home';

export default { title: 'Components / Pill' } as StoryDefault;

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 12,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

export const Default: Story = () => <Pill>Default</Pill>;

export const Sizes: Story = () => (
  <div style={wrapperStyle}>
    {(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as PillSize[]).map((size) => (
      <div key={size} style={rowStyle}>
        <span style={{ width: 32, color: 'var(--dark-60)' }}>{size}</span>
        <Pill size={size}>Label</Pill>
      </div>
    ))}
  </div>
);

export const WithIcon: Story = () => (
  <div style={wrapperStyle}>
    <Pill>
      <Home size={12} />
      Home
    </Pill>
    <Pill size="xl">
      <Home size={16} />
      Home
    </Pill>
  </div>
);
