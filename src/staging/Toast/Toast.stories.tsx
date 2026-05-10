import type { Story, StoryDefault } from '@ladle/react';
import { Toast } from './Toast';

export default { title: 'Components / Toast' } as StoryDefault;

export const Default: Story = () => <Toast>Saved · Welcome Stack</Toast>;

export const Variants: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Toast variant="success">Reply published · Maria H.</Toast>
    <Toast variant="generating">Generating draft…</Toast>
    <Toast variant="error">Couldn’t publish — try again</Toast>
  </div>
);

export const WithAction: Story = () => (
  <Toast action={{ label: 'Undo', onClick: () => undefined }}>
    Reply skipped
  </Toast>
);

export const WithDismiss: Story = () => (
  <Toast onDismiss={() => undefined}>Heads up · CPC spike on “wellness”</Toast>
);
