import type { Story, StoryDefault } from '@ladle/react';
import { Logo } from './Logo';

export default { title: 'Components / Logo' } as StoryDefault;

export const Default: Story = () => <Logo />;

export const Variants: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
    <div style={{ background: '#2B2F38', padding: 16, borderRadius: 8 }}>
      <Logo variant="full" size={48} />
    </div>
    <Logo variant="mark" size={32} />
  </div>
);
