import { render, screen } from '@testing-library/react';
import { Pill } from './Pill';
import type { PillSize } from './Types';

describe('Pill', () => {
  it('renders children', () => {
    render(<Pill>Hello</Pill>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <Pill data-testid="t" aria-label="tag">
        Hello
      </Pill>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'tag');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Pill className="custom">hi</Pill>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Pill ref={ref}>hi</Pill>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('defaults to size md', () => {
    const { container } = render(<Pill>hi</Pill>);
    expect(container.firstChild).toHaveClass('size-md');
  });

  it.each<PillSize>(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'])(
    'applies size class for %s',
    (size) => {
      const { container } = render(<Pill size={size}>hi</Pill>);
      expect(container.firstChild).toHaveClass(`size-${size}`);
    },
  );

  it('renders nested children (icon + label) without forking the component', () => {
    render(
      <Pill>
        <svg data-testid="leading-icon" width={12} height={12} />
        <span>Label</span>
      </Pill>,
    );
    expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });
});
