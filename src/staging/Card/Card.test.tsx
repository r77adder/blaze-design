import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import type { CardPadding } from './Types';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>hello</Card>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <Card data-testid="t" aria-label="card">
        hi
      </Card>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'card');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Card className="custom">hi</Card>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref}>hi</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it.each<CardPadding>(['none', 'sm', 'md', 'lg'])(
    'applies padding class for %s',
    (padding) => {
      const { container } = render(<Card padding={padding}>hi</Card>);
      expect(container.firstChild).toHaveClass(`padding-${padding}`);
    },
  );

  it('defaults to medium padding', () => {
    const { container } = render(<Card>hi</Card>);
    expect(container.firstChild).toHaveClass('padding-md');
  });

  it('does not set tabIndex or role when not interactive', () => {
    const { container } = render(<Card>hi</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).not.toHaveAttribute('role');
  });

  it('sets tabIndex=0 and role="button" when interactive', () => {
    const { container } = render(<Card interactive>hi</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('applies the interactive class when interactive', () => {
    const { container } = render(<Card interactive>hi</Card>);
    expect(container.firstChild).toHaveClass('interactive');
  });

  it('fires onClick on Enter when interactive', () => {
    const onClick = jest.fn();
    render(
      <Card interactive onClick={onClick} data-testid="card">
        hi
      </Card>,
    );
    fireEvent.keyDown(screen.getByTestId('card'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick on Space when interactive', () => {
    const onClick = jest.fn();
    render(
      <Card interactive onClick={onClick} data-testid="card">
        hi
      </Card>,
    );
    fireEvent.keyDown(screen.getByTestId('card'), { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not activate on Enter/Space when not interactive', () => {
    const onClick = jest.fn();
    render(
      <Card onClick={onClick} data-testid="card">
        hi
      </Card>,
    );
    fireEvent.keyDown(screen.getByTestId('card'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('still fires onClick on actual click when interactive', () => {
    const onClick = jest.fn();
    render(
      <Card interactive onClick={onClick} data-testid="card">
        hi
      </Card>,
    );
    fireEvent.click(screen.getByTestId('card'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
