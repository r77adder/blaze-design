import { render, screen, fireEvent } from '@testing-library/react';
import { NavSection } from './NavSection';

describe('NavSection', () => {
  it('renders children', () => {
    render(<NavSection>hi</NavSection>);
    expect(screen.getByText('hi')).toBeInTheDocument();
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <NavSection data-testid="t" aria-label="a">
        hi
      </NavSection>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'a');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<NavSection className="custom">hi</NavSection>);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<NavSection ref={ref}>hi</NavSection>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders the label when provided', () => {
    render(<NavSection label="Demand Gen">hi</NavSection>);
    expect(screen.getByText('Demand Gen')).toBeInTheDocument();
  });

  it('does not render a label element when label is omitted', () => {
    const { container } = render(<NavSection>hi</NavSection>);
    expect(container.querySelector('.label')).toBeNull();
  });

  it('renders label and children together', () => {
    render(
      <NavSection label="Settings">
        <span data-testid="child-a">A</span>
        <span data-testid="child-b">B</span>
      </NavSection>,
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByTestId('child-a')).toBeInTheDocument();
    expect(screen.getByTestId('child-b')).toBeInTheDocument();
  });

  describe('collapsible', () => {
    it('renders the label as a static div by default (non-collapsible)', () => {
      render(<NavSection label="Reach">hi</NavSection>);
      expect(screen.queryByRole('button', { name: /reach/i })).toBeNull();
      expect(screen.getByText('Reach')).toBeInTheDocument();
    });

    it('renders the label as a button with aria-expanded when collapsible', () => {
      render(
        <NavSection label="Reach" collapsible>
          <span data-testid="child">x</span>
        </NavSection>,
      );
      const btn = screen.getByRole('button', { name: /reach/i });
      expect(btn).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides children when defaultCollapsed is true', () => {
      render(
        <NavSection label="Reach" collapsible defaultCollapsed>
          <span data-testid="child">x</span>
        </NavSection>,
      );
      expect(screen.queryByTestId('child')).toBeNull();
      expect(screen.getByRole('button', { name: /reach/i })).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggles children visibility when the button is clicked', () => {
      render(
        <NavSection label="Reach" collapsible>
          <span data-testid="child">x</span>
        </NavSection>,
      );
      const btn = screen.getByRole('button', { name: /reach/i });
      expect(screen.getByTestId('child')).toBeInTheDocument();
      fireEvent.click(btn);
      expect(screen.queryByTestId('child')).toBeNull();
      expect(btn).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(btn);
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles via Enter key', () => {
      render(
        <NavSection label="Reach" collapsible>
          <span data-testid="child">x</span>
        </NavSection>,
      );
      const btn = screen.getByRole('button', { name: /reach/i });
      fireEvent.keyDown(btn, { key: 'Enter' });
      expect(screen.queryByTestId('child')).toBeNull();
    });

    it('toggles via Space key', () => {
      render(
        <NavSection label="Reach" collapsible>
          <span data-testid="child">x</span>
        </NavSection>,
      );
      const btn = screen.getByRole('button', { name: /reach/i });
      fireEvent.keyDown(btn, { key: ' ' });
      expect(screen.queryByTestId('child')).toBeNull();
    });

    it('falls back to non-collapsible when label is missing', () => {
      // No affordance for the user to toggle without a label, so we keep the
      // children visible and skip the button rendering.
      render(
        <NavSection collapsible>
          <span data-testid="child">x</span>
        </NavSection>,
      );
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('toggles the `expanded` class on the root, mirroring prod SectionHeader rotation', () => {
      // Prod rotates the chevron via `.expanded .label svg { transform: rotate(90deg) }`.
      // We assert the wrapper class flip here — jsdom can't compute the
      // CSS-driven rotation, but the class presence is the contract.
      const { container } = render(
        <NavSection label="Reach" collapsible>
          <span>x</span>
        </NavSection>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('expanded');
      const btn = screen.getByRole('button', { name: /reach/i });
      fireEvent.click(btn);
      expect(root).not.toHaveClass('expanded');
    });

    it('renders the prod ChevronRight icon in the collapsible header', () => {
      // The prod SectionHeader uses ChevronRight from almanac-ui/icons/12;
      // we ported that icon as src/icons/12/ChevronRight which carries
      // data-testid="chevron-right-icon".
      render(
        <NavSection label="Reach" collapsible>
          <span>x</span>
        </NavSection>,
      );
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });
  });
});
