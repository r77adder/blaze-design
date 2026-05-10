import type { Story, StoryDefault } from '@ladle/react';
import { Paragraph } from './Paragraph';
import type { TextVariant } from './Types';

export default { title: 'Components / Paragraph' } as StoryDefault;

const VARIANTS: TextVariant[] = [
  'primary',
  'secondary',
  'placeholder',
  'label',
  'largeList',
  'smallList',
  'metadata',
];

export const Default: Story = () => (
  <Paragraph>The quick brown fox jumps over the lazy dog.</Paragraph>
);

export const Variants: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
    {VARIANTS.map((variant) => (
      <Paragraph key={variant} variant={variant}>
        [{variant}] The quick brown fox jumps over the lazy dog.
      </Paragraph>
    ))}
  </div>
);

export const LineClamp: Story = () => (
  <div style={{ maxWidth: 320 }}>
    <Paragraph lineClamp={2}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
    </Paragraph>
  </div>
);
