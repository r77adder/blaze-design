import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import { TabChip } from './TabChip';

export default { title: 'Components / TabChip' } as StoryDefault;

export const Default: Story = () => <TabChip>All</TabChip>;

export const Selected: Story = () => <TabChip selected>All</TabChip>;

export const WithCount: Story = () => <TabChip count={12}>Insights</TabChip>;

export const SelectedWithCount: Story = () => (
  <TabChip selected count={3}>
    Needs your sign-off
  </TabChip>
);

export const Strip: Story = () => {
  const [active, setActive] = useState<'all' | 'action' | 'insight'>('all');
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <TabChip selected={active === 'all'} count={15} onSelect={() => setActive('all')}>
        All
      </TabChip>
      <TabChip selected={active === 'action'} count={3} onSelect={() => setActive('action')}>
        Needs your sign-off
      </TabChip>
      <TabChip selected={active === 'insight'} count={12} onSelect={() => setActive('insight')}>
        Insights
      </TabChip>
    </div>
  );
};
