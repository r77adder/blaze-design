import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';
import type { ToastVariant } from './Types';

const TestIcon = ({ size = 14 }: { size?: number }) => (
  <svg data-testid="custom-icon" width={size} height={size} />
);

describe('Toast', () => {
  it('renders children', () => {
    render(<Toast>Saved</Toast>);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('uses role="status" by default for screen-reader announcement', () => {
    render(<Toast>Saved</Toast>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('respects a consumer-provided role', () => {
    render(<Toast role="alert">Saved</Toast>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each<ToastVariant>(['success', 'generating', 'error'])(
    'applies variant class for %s',
    (variant) => {
      const { container } = render(<Toast variant={variant}>Hi</Toast>);
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    },
  );

  it('defaults to variant success', () => {
    const { container } = render(<Toast>Hi</Toast>);
    expect(container.firstChild).toHaveClass('variant-success');
  });

  it('renders the default icon when no icon is provided', () => {
    const { container } = render(<Toast>Hi</Toast>);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders a custom icon when provided', () => {
    render(<Toast icon={TestIcon}>Hi</Toast>);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders the action button when action is provided', () => {
    const onClick = jest.fn();
    render(<Toast action={{ label: 'Undo', onClick }}>Saved</Toast>);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('fires action.onClick when the action button is clicked', () => {
    const onClick = jest.fn();
    render(<Toast action={{ label: 'Undo', onClick }}>Saved</Toast>);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the dismiss button when onDismiss is provided', () => {
    const onDismiss = jest.fn();
    render(<Toast onDismiss={onDismiss}>Saved</Toast>);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('does not render the dismiss button when onDismiss is not provided', () => {
    render(<Toast>Saved</Toast>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('fires onDismiss when the × button is clicked', () => {
    const onDismiss = jest.fn();
    render(<Toast onDismiss={onDismiss}>Saved</Toast>);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <Toast data-testid="t" aria-label="notice">
        Hi
      </Toast>,
    );
    expect(screen.getByTestId('t')).toHaveAttribute('aria-label', 'notice');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Toast className="custom">Hi</Toast>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Toast ref={ref}>Hi</Toast>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
