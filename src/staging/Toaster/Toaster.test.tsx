import { act, render, screen } from '@testing-library/react';
import { Toaster } from './Toaster';
import { ToasterProvider } from './ToasterProvider';
import { useToast } from './useToast';

function ShowOne({ message = 'hi' }: { message?: string }) {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => showToast({ message })}>
      trigger
    </button>
  );
}

describe('useToast + ToasterProvider + Toaster', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders nothing when no toasts are active', () => {
    render(
      <ToasterProvider>
        <Toaster />
      </ToasterProvider>,
    );
    expect(screen.queryByRole('region', { name: /Notifications/ })).toBeNull();
  });

  it('throws when useToast is called outside ToasterProvider', () => {
    const Bad = () => {
      useToast();
      return null;
    };
    // Suppress React's expected error log noise
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(/must be used inside a <ToasterProvider>/);
    spy.mockRestore();
  });

  it('shows a toast when showToast is called', () => {
    render(
      <ToasterProvider>
        <ShowOne message="Hello world" />
        <Toaster />
      </ToasterProvider>,
    );
    act(() => {
      screen.getByText('trigger').click();
    });
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('auto-dismisses after the default 2400ms', () => {
    render(
      <ToasterProvider>
        <ShowOne message="Auto goodbye" />
        <Toaster />
      </ToasterProvider>,
    );
    act(() => {
      screen.getByText('trigger').click();
    });
    expect(screen.getByText('Auto goodbye')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(2400);
    });
    expect(screen.queryByText('Auto goodbye')).toBeNull();
  });

  it('dismissAfter=0 keeps the toast visible until dismissed manually', () => {
    function Sticky() {
      const { showToast } = useToast();
      return (
        <button type="button" onClick={() => showToast({ message: 'sticky', dismissAfter: 0 })}>
          go
        </button>
      );
    }
    render(
      <ToasterProvider>
        <Sticky />
        <Toaster />
      </ToasterProvider>,
    );
    act(() => {
      screen.getByText('go').click();
    });
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('sticky')).toBeInTheDocument();
  });

  it('stacks multiple toasts in insertion order', () => {
    function Stack() {
      const { showToast } = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            showToast({ message: 'one' });
            showToast({ message: 'two' });
            showToast({ message: 'three' });
          }}
        >
          go
        </button>
      );
    }
    render(
      <ToasterProvider>
        <Stack />
        <Toaster />
      </ToasterProvider>,
    );
    act(() => {
      screen.getByText('go').click();
    });
    const region = screen.getByRole('region', { name: /Notifications/ });
    const text = region.textContent ?? '';
    expect(text.indexOf('one')).toBeLessThan(text.indexOf('two'));
    expect(text.indexOf('two')).toBeLessThan(text.indexOf('three'));
  });

  it('returns the toast id from showToast for programmatic dismissal', () => {
    let toastId = '';
    function Programmatic() {
      const { showToast, dismissToast } = useToast();
      return (
        <>
          <button type="button" onClick={() => (toastId = showToast({ message: 'temp', dismissAfter: 0 }))}>
            show
          </button>
          <button type="button" onClick={() => dismissToast(toastId)}>
            kill
          </button>
        </>
      );
    }
    render(
      <ToasterProvider>
        <Programmatic />
        <Toaster />
      </ToasterProvider>,
    );
    act(() => {
      screen.getByText('show').click();
    });
    expect(screen.getByText('temp')).toBeInTheDocument();
    act(() => {
      screen.getByText('kill').click();
    });
    expect(screen.queryByText('temp')).toBeNull();
  });
});
