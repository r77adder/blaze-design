import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import type { ButtonSize, ButtonVariant } from './Types';

const FrontIcon = ({ size = 16 }: { size?: number }) => (
  <svg data-testid="front-icon" width={size} height={size} />
);
const EndIcon = ({ size = 16 }: { size?: number }) => (
  <svg data-testid="end-icon" width={size} height={size} />
);

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Press me</Button>);
    expect(screen.getByRole('button', { name: 'Press me' })).toBeInTheDocument();
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <Button data-testid="t" aria-label="Press">
        Press
      </Button>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'Press');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Button className="custom">hi</Button>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying button', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>hi</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('defaults type to "button" (not "submit")', () => {
    render(<Button>hi</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('respects an explicit type attribute', () => {
    render(<Button type="submit">submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it.each<ButtonVariant>(['primary', 'secondary', 'tertiary'])(
    'applies variant class for %s',
    (variant) => {
      const { container } = render(<Button variant={variant}>hi</Button>);
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    },
  );

  it.each<ButtonSize>(['xs', 'sm', 'md', 'lg', 'xl'])(
    'applies size class for %s',
    (size) => {
      const { container } = render(<Button size={size}>hi</Button>);
      expect(container.firstChild).toHaveClass(`size-${size}`);
    },
  );

  it('applies the size class — proxy for verifying the right typography mixin is wired in', () => {
    // jsdom doesn't compute SCSS module styles. Per CONVENTIONS we use prod's
    // redesign-mode typography (sm-sohne / md-sohne, weight 400) — NOT the
    // default-mode -medium variants. The size class is the load-bearing wiring
    // and the mixin choice lives in Button.module.scss.size-<size>.
    const { container } = render(<Button size="md">hi</Button>);
    expect(container.firstChild).toHaveClass('size-md');
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when isDisabled', () => {
    const onClick = jest.fn();
    render(
      <Button isDisabled onClick={onClick}>
        Press
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets disabled and aria-disabled when isDisabled is true', () => {
    render(<Button isDisabled>hi</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders frontIcon when provided', () => {
    render(<Button frontIcon={FrontIcon}>Press</Button>);
    expect(screen.getByTestId('front-icon')).toBeInTheDocument();
  });

  it('renders endIcon when provided', () => {
    render(<Button endIcon={EndIcon}>Press</Button>);
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('renders both icons together', () => {
    render(
      <Button frontIcon={FrontIcon} endIcon={EndIcon}>
        Press
      </Button>,
    );
    expect(screen.getByTestId('front-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth is true', () => {
    const { container } = render(<Button fullWidth>hi</Button>);
    expect(container.firstChild).toHaveClass('fullWidth');
  });
});
