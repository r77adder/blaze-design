import type { Story, StoryDefault } from '@ladle/react';
import { Chip } from './Chip';
import type { ChipSize } from './Types';
import Home from '../../icons/20/Home';

export default { title: 'Components / Chip' } as StoryDefault;

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

export const Default: Story = () => <Chip>Filter</Chip>;

export const Selected: Story = () => (
  <div style={wrapperStyle}>
    <Chip selected>Selected</Chip>
    <Chip>Click to select</Chip>
  </div>
);

export const WithIcon: Story = () => (
  <div style={wrapperStyle}>
    <Chip icon={Home}>Home</Chip>
    <Chip icon={Home} selected>
      Home
    </Chip>
  </div>
);

export const Deletable: Story = () => (
  <div style={wrapperStyle}>
    <Chip deletable onDelete={() => undefined}>
      Removable
    </Chip>
    <Chip deletable icon={Home} onDelete={() => undefined}>
      With icon
    </Chip>
  </div>
);

export const AddVariant: Story = () => (
  <div style={wrapperStyle}>
    <Chip variant="add">Add filter</Chip>
  </div>
);

export const AllSizes: Story = () => (
  <div style={wrapperStyle}>
    {(['sm', 'md', 'lg', 'xl'] as ChipSize[]).map((size) => (
      <div key={size} style={rowStyle}>
        <span style={{ width: 32, color: 'var(--dark-60)' }}>{size}</span>
        <Chip size={size}>Default</Chip>
        <Chip size={size} selected>
          Selected
        </Chip>
        <Chip size={size} variant="add">
          Add
        </Chip>
      </div>
    ))}
  </div>
);
