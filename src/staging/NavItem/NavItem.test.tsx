import { render, screen, fireEvent } from '@testing-library/react';
import { NavItem } from './NavItem';
import { useNavItemContext } from './NavItemContext';

const TestIcon = ({ size = 20 }: { size?: number }) => (
  <svg data-testid="nav-icon" width={size} height={size} />
);

const ContextProbe = () => {
  const { isActive, isHovered } = useNavItemContext();
  return (
    <span data-testid="probe" data-is-active={String(isActive)} data-is-hovered={String(isHovered)} />
  );
};

describe('NavItem (Root)', () => {
  it('renders children', () => {
    render(
      <NavItem>
        <NavItem.Label label="Home" />
      </NavItem>,
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('applies the active class when isActive=true', () => {
    const { container } = render(
      <NavItem isActive>
        <NavItem.Label label="Home" />
      </NavItem>,
    );
    expect(container.firstChild).toHaveClass('active');
  });

  it('applies the highlighted class when isHighlighted=true and skips active', () => {
    const { container } = render(
      <NavItem isActive isHighlighted>
        <NavItem.Label label="Home" />
      </NavItem>,
    );
    expect(container.firstChild).toHaveClass('highlighted');
    expect(container.firstChild).not.toHaveClass('active');
  });

  it('calls onPress when clicked', () => {
    const onPress = jest.fn();
    render(
      <NavItem onPress={onPress}>
        <NavItem.Label label="Home" />
      </NavItem>,
    );
    fireEvent.click(screen.getByText('Home'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onPress when Enter is pressed', () => {
    const onPress = jest.fn();
    render(
      <NavItem onPress={onPress}>
        <NavItem.Label label="Home" />
      </NavItem>,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onPress when Space is pressed', () => {
    const onPress = jest.fn();
    render(
      <NavItem onPress={onPress}>
        <NavItem.Label label="Home" />
      </NavItem>,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders arbitrary children (icon + label composition)', () => {
    render(
      <NavItem>
        <TestIcon />
        <NavItem.Label label="Home" />
      </NavItem>,
    );
    expect(screen.getByTestId('nav-icon')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('exposes isActive to descendants via NavItemContext', () => {
    render(
      <NavItem isActive>
        <ContextProbe />
      </NavItem>,
    );
    expect(screen.getByTestId('probe')).toHaveAttribute('data-is-active', 'true');
  });

  it('exposes isHovered to descendants when hovered', () => {
    render(
      <NavItem>
        <ContextProbe />
      </NavItem>,
    );
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-is-hovered', 'false');
    fireEvent.mouseEnter(screen.getByRole('button'));
    expect(probe).toHaveAttribute('data-is-hovered', 'true');
    fireEvent.mouseLeave(screen.getByRole('button'));
    expect(probe).toHaveAttribute('data-is-hovered', 'false');
  });

  it('applies the size class for each size', () => {
    const { rerender, container } = render(<NavItem size="sm" />);
    expect(container.firstChild).toHaveClass('size-sm');
    rerender(<NavItem size="md" />);
    expect(container.firstChild).toHaveClass('size-md');
    rerender(<NavItem size="lg" />);
    expect(container.firstChild).toHaveClass('size-lg');
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <NavItem data-testid="t" aria-label="Home nav">
        <NavItem.Label label="Home" />
      </NavItem>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'Home nav');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<NavItem className="custom" />);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<NavItem ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('exposes Root, Label, Counter, Trail as namespaced sub-components', () => {
    expect(typeof NavItem.Root).toBe('object'); // forwardRef returns an object
    expect(typeof NavItem.Label).toBe('function');
    expect(typeof NavItem.Counter).toBe('function');
    expect(typeof NavItem.Trail).toBe('function');
  });
});

describe('NavItem.Trail', () => {
  it('renders freeform children (e.g. fraction strings)', () => {
    render(<NavItem.Trail>3/10</NavItem.Trail>);
    expect(screen.getByText('3/10')).toBeInTheDocument();
  });

  it('applies the trail class', () => {
    const { container } = render(<NavItem.Trail>New</NavItem.Trail>);
    expect(container.firstChild).toHaveClass('trail');
  });

  it('merges consumer classNames', () => {
    const { container } = render(<NavItem.Trail classNames="custom">3/10</NavItem.Trail>);
    expect(container.firstChild).toHaveClass('trail');
    expect(container.firstChild).toHaveClass('custom');
  });
});

describe('NavItem.Label', () => {
  it('renders the label text', () => {
    render(<NavItem.Label label="Settings" />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('applies the label class so the sm-sohne mixin attaches', () => {
    // jsdom can't compute SCSS, so we assert the class is present rather than
    // the resolved font. The class wires into Label.module.scss `@include sm-sohne`.
    const { container } = render(<NavItem.Label label="Settings" />);
    expect(container.firstChild).toHaveClass('label');
  });

  it('sets the title attribute equal to the label (truncation tooltip)', () => {
    const { container } = render(<NavItem.Label label="A long label" />);
    expect(container.firstChild).toHaveAttribute('title', 'A long label');
  });

  it('merges consumer classNames', () => {
    const { container } = render(<NavItem.Label label="Settings" classNames="custom" />);
    expect(container.firstChild).toHaveClass('label');
    expect(container.firstChild).toHaveClass('custom');
  });
});

describe('NavItem.Counter', () => {
  it('renders the total when total >= 1', () => {
    render(<NavItem.Counter total={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders nothing when total < 1 (mirrors prod contract)', () => {
    const { container } = render(<NavItem.Counter total={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('applies the active class when isActive=true', () => {
    render(<NavItem.Counter total={3} isActive />);
    expect(screen.getByText('3')).toHaveClass('active');
  });

  it('reads isActive from NavItemContext when no prop is passed', () => {
    render(
      <NavItem isActive>
        <NavItem.Counter total={3} />
      </NavItem>,
    );
    expect(screen.getByText('3')).toHaveClass('active');
  });

  it('applies the counter wrapper class so margin-left auto right-aligns', () => {
    const { container } = render(<NavItem.Counter total={3} />);
    expect(container.firstChild).toHaveClass('counter');
  });

  it('merges consumer classNames on the wrapper', () => {
    const { container } = render(<NavItem.Counter total={3} classNames="custom" />);
    expect(container.firstChild).toHaveClass('counter');
    expect(container.firstChild).toHaveClass('custom');
  });
});
