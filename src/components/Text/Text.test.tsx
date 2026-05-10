import { render, screen } from '@testing-library/react';
import { Text } from './Text';
import type { TextVariant } from './Types';

const VARIANTS: TextVariant[] = [
  'primary',
  'secondary',
  'placeholder',
  'label',
  'largeList',
  'smallList',
  'metadata',
];

describe('Text', () => {
  it('renders children', () => {
    render(<Text>hello</Text>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders as a span', () => {
    const { container } = render(<Text>hi</Text>);
    expect(container.firstChild).toBeInstanceOf(HTMLSpanElement);
  });

  it('defaults to the primary variant', () => {
    const { container } = render(<Text>hi</Text>);
    expect(container.firstChild).toHaveClass('primary');
  });

  it.each(VARIANTS)('applies the variant class for %s', (variant) => {
    const { container } = render(<Text variant={variant}>hi</Text>);
    expect(container.firstChild).toHaveClass(variant);
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Text ref={ref}>hi</Text>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <Text data-testid="t" aria-label="greeting" role="note">
        hi
      </Text>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'greeting');
    expect(el).toHaveAttribute('role', 'note');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Text className="custom">hi</Text>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies inline color via the color prop', () => {
    const { container } = render(<Text color="rgb(255, 0, 0)">hi</Text>);
    expect(container.firstChild).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('sets the --lines-to-clamp CSS var when lineClamp > 1', () => {
    const { container } = render(<Text lineClamp={3}>hi</Text>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue('--lines-to-clamp')).toBe('3');
    expect(el).toHaveClass('lineClamp');
    expect(el).not.toHaveClass('lineClampForceSingleLine');
  });

  it('applies the single-line clamp class when lineClamp === 1', () => {
    const { container } = render(<Text lineClamp={1}>hi</Text>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('lineClampForceSingleLine');
    expect(el).not.toHaveClass('lineClamp');
  });

  it('preserves consumer-provided inline style alongside color/lineClamp', () => {
    const { container } = render(
      <Text style={{ marginTop: 8 }} color="rgb(0, 0, 255)">
        hi
      </Text>,
    );
    expect(container.firstChild).toHaveStyle({ marginTop: '8px', color: 'rgb(0, 0, 255)' });
  });
});
