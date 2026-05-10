import type { Story, StoryDefault } from '@ladle/react';
import { Avatar } from './Avatar';

export default { title: 'Components / Avatar' } as StoryDefault;

export const Default: Story = () => <Avatar fallback="FH" />;

export const Sizes: Story = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <Avatar fallback="FH" size="sm" />
    <Avatar fallback="FH" size="md" />
    <Avatar fallback="FH" size="lg" />
  </div>
);

export const WithImage: Story = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <Avatar
      src="https://i.pravatar.cc/64?img=12"
      fallback="FH"
      alt="Fabian"
      size="sm"
    />
    <Avatar
      src="https://i.pravatar.cc/64?img=12"
      fallback="FH"
      alt="Fabian"
      size="md"
    />
    <Avatar
      src="https://i.pravatar.cc/64?img=12"
      fallback="FH"
      alt="Fabian"
      size="lg"
    />
  </div>
);

export const Fallback: Story = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <Avatar fallback="K" size="sm" />
    <Avatar fallback="FH" size="md" />
    <Avatar fallback="MAR" size="lg" />
  </div>
);
