import type { Story, StoryDefault } from '@ladle/react';
import { Heading } from './Heading';
import type { HeadingLevel } from './Types';

export default { title: 'Components / Heading' } as StoryDefault;

const LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5];

export const Default: Story = () => <Heading level={1}>The quick brown fox</Heading>;

export const AllLevels: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {LEVELS.map((level) => (
      <Heading key={level} level={level}>
        Heading level {level}
      </Heading>
    ))}
  </div>
);

export const LineClamp: Story = () => (
  <div style={{ maxWidth: 320 }}>
    <Heading level={3} lineClamp={2}>
      A long heading that wraps onto a second line and then truncates with an ellipsis
    </Heading>
  </div>
);

export const Color: Story = () => (
  <Heading level={2} color="var(--purple)">
    Heading in purple
  </Heading>
);
