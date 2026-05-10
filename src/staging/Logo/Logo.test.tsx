import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders an svg element', () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('uses the full viewBox by default', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 199 56');
  });

  it('uses the mark viewBox when variant="mark"', () => {
    const { container } = render(<Logo variant="mark" />);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 93 28');
  });

  it('applies the size prop as height', () => {
    const { container } = render(<Logo size={48} />);
    expect(container.querySelector('svg')).toHaveAttribute('height', '48');
  });

  it('forwards arbitrary attributes via ...rest', () => {
    render(<Logo data-testid="t" aria-label="Brand mark" />);
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'Brand mark');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Logo className="custom" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('root');
    expect(svg).toHaveClass('custom');
  });

  it('forwards ref to the underlying svg element', () => {
    const ref = { current: null as SVGSVGElement | null };
    render(<Logo ref={ref} />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });
});
