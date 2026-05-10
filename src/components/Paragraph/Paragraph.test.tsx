import { render, screen } from '@testing-library/react';
import { Paragraph } from './Paragraph';
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

describe('Paragraph', () => {
  it('renders children', () => {
    render(<Paragraph>hello</Paragraph>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders as a p element', () => {
    const { container } = render(<Paragraph>hi</Paragraph>);
    expect(container.firstChild).toBeInstanceOf(HTMLParagraphElement);
  });

  it('defaults to the primary variant', () => {
    const { container } = render(<Paragraph>hi</Paragraph>);
    expect(container.firstChild).toHaveClass('primary');
  });

  it.each(VARIANTS)('applies the variant class for %s', (variant) => {
    const { container } = render(<Paragraph variant={variant}>hi</Paragraph>);
    expect(container.firstChild).toHaveClass(variant);
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLParagraphElement | null };
    render(<Paragraph ref={ref}>hi</Paragraph>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <Paragraph data-testid="t" aria-label="paragraph">
        hi
      </Paragraph>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'paragraph');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Paragraph className="custom">hi</Paragraph>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies inline color via the color prop', () => {
    const { container } = render(<Paragraph color="rgb(0, 0, 255)">hi</Paragraph>);
    expect(container.firstChild).toHaveStyle({ color: 'rgb(0, 0, 255)' });
  });

  it('sets the --lines-to-clamp CSS var when lineClamp > 1', () => {
    const { container } = render(<Paragraph lineClamp={4}>hi</Paragraph>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue('--lines-to-clamp')).toBe('4');
    expect(el).toHaveClass('lineClamp');
  });

  it('applies the single-line clamp class when lineClamp === 1', () => {
    const { container } = render(<Paragraph lineClamp={1}>hi</Paragraph>);
    expect(container.firstChild).toHaveClass('lineClampForceSingleLine');
  });
});
