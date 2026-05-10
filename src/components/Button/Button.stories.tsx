import type { Story, StoryDefault } from '@ladle/react';
import { Button } from './Button';
import type { ButtonSize, ButtonVariant } from './Types';
import Home from '../../icons/20/Home';
import Settings from '../../icons/20/Settings';

export default { title: 'Components / Button' } as StoryDefault;

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

export const Default: Story = () => <Button>Default</Button>;

export const Variants: Story = () => (
  <div style={wrapperStyle}>
    {(['primary', 'secondary', 'tertiary'] as ButtonVariant[]).map((variant) => (
      <Button key={variant} variant={variant}>
        {variant}
      </Button>
    ))}
  </div>
);

export const Sizes: Story = () => (
  <div style={wrapperStyle}>
    {(['xs', 'sm', 'md', 'lg', 'xl'] as ButtonSize[]).map((size) => (
      <div key={size} style={rowStyle}>
        <span style={{ width: 32, color: 'var(--dark-60)' }}>{size}</span>
        <Button size={size}>Primary</Button>
        <Button size={size} variant="secondary">
          Secondary
        </Button>
        <Button size={size} variant="tertiary">
          Tertiary
        </Button>
      </div>
    ))}
  </div>
);

export const WithFrontIcon: Story = () => (
  <div style={wrapperStyle}>
    <Button frontIcon={Home}>Home</Button>
    <Button frontIcon={Home} variant="secondary">
      Home
    </Button>
    <Button frontIcon={Home} variant="tertiary">
      Home
    </Button>
  </div>
);

export const WithEndIcon: Story = () => (
  <div style={wrapperStyle}>
    <Button endIcon={Settings}>Settings</Button>
    <Button endIcon={Settings} variant="secondary">
      Settings
    </Button>
    <Button endIcon={Settings} variant="tertiary">
      Settings
    </Button>
  </div>
);

export const Disabled: Story = () => (
  <div style={wrapperStyle}>
    <Button isDisabled>Primary</Button>
    <Button isDisabled variant="secondary">
      Secondary
    </Button>
    <Button isDisabled variant="tertiary">
      Tertiary
    </Button>
  </div>
);
