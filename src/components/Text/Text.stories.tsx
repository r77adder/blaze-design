import type { Story, StoryDefault } from '@ladle/react';
import { Text } from './Text';
import type { TextVariant } from './Types';

export default { title: 'Components / Text' } as StoryDefault;

const VARIANTS: TextVariant[] = [
  'primary',
  'secondary',
  'placeholder',
  'label',
  'largeList',
  'smallList',
  'metadata',
];

export const Default: Story = () => <Text>The quick brown fox</Text>;

export const Variants: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {VARIANTS.map((variant) => (
      <div key={variant} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <Text variant="metadata" style={{ width: 100, color: 'var(--dark-60)' }}>
          {variant}
        </Text>
        <Text variant={variant}>The quick brown fox jumps over the lazy dog</Text>
      </div>
    ))}
  </div>
);

export const LineClamp: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
    <Text lineClamp={1}>
      Single-line clamp truncates this very long sentence with an ellipsis at the end.
    </Text>
    <Text lineClamp={2}>
      Two-line clamp lets the text wrap onto a second line and then truncates. This text
      should wrap and clip after two lines exactly.
    </Text>
  </div>
);

export const Color: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <Text color="var(--dark-60)">color via CSS var (dark-60)</Text>
    <Text color="#9333ea">color via hex (purple)</Text>
    <Text color="rgb(220, 38, 38)">color via rgb (red)</Text>
  </div>
);
