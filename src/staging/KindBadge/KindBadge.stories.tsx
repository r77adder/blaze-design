import type { Story, StoryDefault } from '@ladle/react';
import { KindBadge } from './KindBadge';

export default { title: 'Components / KindBadge' } as StoryDefault;

export const Default: Story = () => <KindBadge kind="action" />;

export const AllKinds: Story = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    <KindBadge kind="action" />
    <KindBadge kind="alert" />
    <KindBadge kind="insight" />
  </div>
);

export const CustomLabel: Story = () => (
  <KindBadge kind="alert" label="Urgent" />
);
