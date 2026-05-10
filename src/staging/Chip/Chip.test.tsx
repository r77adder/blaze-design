import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from './Chip';
import type { ChipSize, ChipVariant } from './Types';

const TestIcon = ({ size = 14 }: { size?: number }) => (
  <svg data-testid="chip-icon" width={size} height={size} />
);

describe('Chip', () => {
  it('renders children', () => {
    render(<Chip>Tag</Chip>);
    expect(screen.getByRole('button', { name: 'Tag' })).toBeInTheDocument();
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <Chip data-testid="t" aria-label="filter">
        Tag
      </Chip>,
    );
    expect(screen.getByTestId('t')).toHaveAttribute('aria-label', 'filter');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Chip className="custom">Tag</Chip>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying button', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Chip ref={ref}>Tag</Chip>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('defaults type to "button" so it does not submit forms', () => {
    render(<Chip>Tag</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it.each<ChipVariant>(['default', 'add'])(
    'applies variant class for %s',
    (variant) => {
      const { container } = render(<Chip variant={variant}>Tag</Chip>);
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    },
  );

  it.each<ChipSize>(['sm', 'md', 'lg', 'xl'])(
    'applies size class for %s',
    (size) => {
      const { container } = render(<Chip size={size}>Tag</Chip>);
      expect(container.firstChild).toHaveClass(`size-${size}`);
    },
  );

  it('toggles selected on click in uncontrolled mode', () => {
    const { container } = render(<Chip>Tag</Chip>);
    const btn = container.firstChild as HTMLButtonElement;
    expect(btn).not.toHaveClass('selected');
    fireEvent.click(btn);
    expect(btn).toHaveClass('selected');
    fireEvent.click(btn);
    expect(btn).not.toHaveClass('selected');
  });

  it('respects controlled selected prop', () => {
    const { container, rerender } = render(<Chip selected={false}>Tag</Chip>);
    expect(container.firstChild).not.toHaveClass('selected');
    fireEvent.click(container.firstChild!);
    // controlled — internal state shouldn't apply
    expect(container.firstChild).not.toHaveClass('selected');
    rerender(<Chip selected>Tag</Chip>);
    expect(container.firstChild).toHaveClass('selected');
  });

  it('fires onSelectionChange with the new value', () => {
    const onSelectionChange = jest.fn();
    render(<Chip onSelectionChange={onSelectionChange}>Tag</Chip>);
    fireEvent.click(screen.getByRole('button', { name: 'Tag' }));
    expect(onSelectionChange).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Tag' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(false);
  });

  it('reflects selected state via aria-pressed', () => {
    const { container, rerender } = render(<Chip selected={false}>Tag</Chip>);
    expect(container.firstChild).toHaveAttribute('aria-pressed', 'false');
    rerender(<Chip selected>Tag</Chip>);
    expect(container.firstChild).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders icon when provided', () => {
    render(<Chip icon={TestIcon}>Tag</Chip>);
    expect(screen.getByTestId('chip-icon')).toBeInTheDocument();
  });

  it('renders the × button when deletable', () => {
    render(
      <Chip deletable onDelete={() => undefined}>
        Tag
      </Chip>,
    );
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('does not render × when deletable is false (default)', () => {
    render(<Chip>Tag</Chip>);
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('clicking × fires onDelete and does NOT toggle selected', () => {
    const onDelete = jest.fn();
    const onSelectionChange = jest.fn();
    const { container } = render(
      <Chip deletable onDelete={onDelete} onSelectionChange={onSelectionChange}>
        Tag
      </Chip>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(container.firstChild).not.toHaveClass('selected');
  });
});
