import { render, screen } from '@testing-library/react';
import { KindBadge } from './KindBadge';
import type { KindBadgeKind } from './Types';

const KIND_LABEL_MATRIX: Array<[KindBadgeKind, string]> = [
  ['action', 'Action needed'],
  ['alert', 'Heads up'],
  ['insight', 'Insight'],
];

describe('KindBadge', () => {
  it.each(KIND_LABEL_MATRIX)(
    'renders the canonical label for kind %s',
    (kind, label) => {
      render(<KindBadge kind={kind} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );

  it.each(KIND_LABEL_MATRIX.map(([k]) => k))(
    'applies kind-specific class for %s',
    (kind) => {
      const { container } = render(<KindBadge kind={kind} />);
      expect(container.firstChild).toHaveClass(`kind-${kind}`);
    },
  );

  it('renders the override label when provided', () => {
    render(<KindBadge kind="action" label="Sign-off needed" />);
    expect(screen.getByText('Sign-off needed')).toBeInTheDocument();
    expect(screen.queryByText('Action needed')).not.toBeInTheDocument();
  });

  it('renders an icon for kind action', () => {
    const { container } = render(<KindBadge kind="action" />);
    expect(container.querySelector('.icon')).not.toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders an icon for kind alert', () => {
    const { container } = render(<KindBadge kind="alert" />);
    expect(container.querySelector('.icon')).not.toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('does not render an icon for kind insight', () => {
    const { container } = render(<KindBadge kind="insight" />);
    expect(container.querySelector('.icon')).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(<KindBadge kind="action" data-testid="t" aria-label="kind" />);
    expect(screen.getByTestId('t')).toHaveAttribute('aria-label', 'kind');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(
      <KindBadge kind="action" className="custom" />,
    );
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying span', () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<KindBadge ref={ref} kind="action" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
