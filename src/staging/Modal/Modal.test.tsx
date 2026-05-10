import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Modal } from './Modal';

function Harness({
  initialOpen = true,
  ...modalProps
}: {
  initialOpen?: boolean;
} & Omit<Parameters<typeof Modal>[0], 'isOpen' | 'onClose'>) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        open
      </button>
      <Modal {...modalProps} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

describe('Modal', () => {
  it('renders nothing when isOpen=false', () => {
    render(<Harness initialOpen={false} title="Hidden" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders title, description, children, and footer when open', () => {
    render(
      <Harness
        title="Pick a thing"
        description="Choose one to continue."
        footer={<span>foot-slot</span>}
      >
        <span>body-slot</span>
      </Harness>,
    );
    expect(screen.getByRole('dialog', { name: 'Pick a thing' })).toBeInTheDocument();
    expect(screen.getByText('Choose one to continue.')).toBeInTheDocument();
    expect(screen.getByText('body-slot')).toBeInTheDocument();
    expect(screen.getByText('foot-slot')).toBeInTheDocument();
  });

  it('omits the head when neither title nor description is provided', () => {
    render(<Harness>just body</Harness>);
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('calls onClose when the close button is clicked', () => {
    render(<Harness title="t">x</Harness>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      screen.getByRole('button', { name: 'Close' }).click();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('calls onClose when the scrim is clicked', () => {
    render(<Harness title="t">x</Harness>);
    const dialog = screen.getByRole('dialog');
    const scrim = dialog.parentElement!;
    act(() => {
      scrim.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not close when clicking inside the modal box', () => {
    render(
      <Harness title="t">
        <button type="button">inner</button>
      </Harness>,
    );
    act(() => {
      screen.getByText('inner').click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<Harness title="t">x</Harness>);
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not close on Escape when dismissOnEscape=false', () => {
    render(
      <Harness title="t" dismissOnEscape={false}>
        x
      </Harness>,
    );
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not close on scrim click when dismissOnScrimClick=false', () => {
    render(
      <Harness title="t" dismissOnScrimClick={false}>
        x
      </Harness>,
    );
    const scrim = screen.getByRole('dialog').parentElement!;
    act(() => {
      scrim.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('locks body overflow while open and restores on close', () => {
    document.body.style.overflow = 'auto';
    const noop = () => {};
    const { rerender } = render(
      <Modal isOpen={true} onClose={noop} title="t">
        x
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal isOpen={false} onClose={noop} title="t">
        x
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('auto');
  });
});
