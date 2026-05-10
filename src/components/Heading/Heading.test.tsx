import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';
import type { HeadingLevel } from './Types';

const LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5];

describe('Heading', () => {
  it('renders children', () => {
    render(<Heading level={1}>hello</Heading>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it.each(LEVELS)('renders the correct h%d tag for level=%d', (level) => {
    const { container } = render(<Heading level={level}>hi</Heading>);
    expect(container.firstChild).toBeInstanceOf(HTMLHeadingElement);
    expect((container.firstChild as Element).tagName.toLowerCase()).toBe(`h${level}`);
  });

  it.each(LEVELS)('applies the level class for level=%d', (level) => {
    const { container } = render(<Heading level={level}>hi</Heading>);
    expect(container.firstChild).toHaveClass(`level${level}`);
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLHeadingElement | null };
    render(
      <Heading level={2} ref={ref}>
        hi
      </Heading>,
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <Heading level={1} data-testid="t" aria-label="title">
        hi
      </Heading>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'title');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(
      <Heading level={3} className="custom">
        hi
      </Heading>,
    );
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies inline color via the color prop', () => {
    const { container } = render(
      <Heading level={1} color="rgb(0, 128, 0)">
        hi
      </Heading>,
    );
    expect(container.firstChild).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  });

  it('sets the --lines-to-clamp CSS var when lineClamp > 1', () => {
    const { container } = render(
      <Heading level={2} lineClamp={2}>
        hi
      </Heading>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue('--lines-to-clamp')).toBe('2');
    expect(el).toHaveClass('lineClamp');
  });

  it('applies the single-line clamp class when lineClamp === 1', () => {
    const { container } = render(
      <Heading level={1} lineClamp={1}>
        hi
      </Heading>,
    );
    expect(container.firstChild).toHaveClass('lineClampForceSingleLine');
  });
});
