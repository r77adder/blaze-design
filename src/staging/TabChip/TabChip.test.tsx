import { render, screen, fireEvent } from '@testing-library/react';
import { TabChip } from './TabChip';

describe('TabChip', () => {
  it('renders children as the label', () => {
    render(<TabChip>All</TabChip>);
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('renders the count when provided', () => {
    render(<TabChip count={12}>All</TabChip>);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('omits the count node when count is undefined', () => {
    const { container } = render(<TabChip>All</TabChip>);
    expect(container.querySelector('[class*="count"]')).toBeNull();
  });

  it('renders count={0} (the only falsy count we still want visible)', () => {
    render(<TabChip count={0}>Insights</TabChip>);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies the selected class when selected=true', () => {
    const { container } = render(<TabChip selected>All</TabChip>);
    expect(container.firstChild).toHaveClass('selected');
  });

  it('does NOT apply selected class when selected=false', () => {
    const { container } = render(<TabChip>All</TabChip>);
    expect(container.firstChild).not.toHaveClass('selected');
  });

  it('reflects selected state via aria-pressed', () => {
    const { rerender } = render(<TabChip>All</TabChip>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    rerender(<TabChip selected>All</TabChip>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<TabChip onSelect={onSelect}>All</TabChip>);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls both onSelect and onClick if both are provided', () => {
    const onSelect = jest.fn();
    const onClick = jest.fn();
    render(
      <TabChip onSelect={onSelect} onClick={onClick}>
        All
      </TabChip>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as a <button type="button"> by default', () => {
    render(<TabChip>All</TabChip>);
    const btn = screen.getByRole('button');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <TabChip data-testid="t" aria-label="a">
        All
      </TabChip>,
    );
    expect(screen.getByTestId('t')).toHaveAttribute('aria-label', 'a');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<TabChip className="custom">All</TabChip>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying button', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<TabChip ref={ref}>All</TabChip>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
