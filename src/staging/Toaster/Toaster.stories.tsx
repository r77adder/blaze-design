import type { Story, StoryDefault } from '@ladle/react';
import { Toaster } from './Toaster';
import { ToasterProvider } from './ToasterProvider';
import { useToast } from './useToast';

export default { title: 'Components / Toaster' } as StoryDefault;

function Trigger() {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button type="button" onClick={() => showToast({ message: 'Saved · #marketing' })}>
        success
      </button>
      <button
        type="button"
        onClick={() => showToast({ variant: 'generating', message: 'Generating ideas…', dismissAfter: 0 })}
      >
        generating (sticky)
      </button>
      <button type="button" onClick={() => showToast({ variant: 'error', message: 'Save failed' })}>
        error
      </button>
    </div>
  );
}

export const Default: Story = () => (
  <ToasterProvider>
    <Trigger />
    <Toaster />
  </ToasterProvider>
);
