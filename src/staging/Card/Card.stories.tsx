import type { Story, StoryDefault } from '@ladle/react';
import { Card } from './Card';
import { Text } from '../../components/Text';
import type { CardPadding } from './Types';

export default { title: 'Components / Card' } as StoryDefault;

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: 320,
};

export const Default: Story = () => (
  <div style={wrapperStyle}>
    <Card>
      <Text variant="largeList">Card title</Text>
      <div style={{ marginTop: 8 }}>
        <Text variant="secondary" color="var(--dark-60)">
          A simple white card with the default 16px padding.
        </Text>
      </div>
    </Card>
  </div>
);

export const PaddingVariants: Story = () => (
  <div style={wrapperStyle}>
    {(['none', 'sm', 'md', 'lg'] as CardPadding[]).map((padding) => (
      <Card key={padding} padding={padding}>
        <Text>padding={padding}</Text>
      </Card>
    ))}
  </div>
);

export const Interactive: Story = () => (
  <div style={wrapperStyle}>
    <Card
      interactive
      onClick={() => {
        // eslint-disable-next-line no-alert
        window.alert('Card pressed');
      }}
    >
      <Text variant="largeList">Click me</Text>
      <div style={{ marginTop: 8 }}>
        <Text variant="secondary" color="var(--dark-60)">
          Hover, focus with Tab, activate with Enter or Space.
        </Text>
      </div>
    </Card>
  </div>
);
