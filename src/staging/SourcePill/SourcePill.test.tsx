import { render, screen } from '@testing-library/react';
import { SourcePill } from './SourcePill';
import type { SourceName } from './Types';

const SOURCE_LABEL_MATRIX: Array<[SourceName, string]> = [
  ['campaigns', 'Campaigns'],
  ['seoaeo', 'SEO/AEO'],
  ['organicsocial', 'Organic Social'],
  ['ugc', 'UGC Content'],
  ['mapranking', 'Map Ranking'],
  ['landingpages', 'Landing Pages'],
  ['paidsearch', 'Paid Search'],
  ['paidsocial', 'Paid Social'],
  ['reputation', 'Reputation'],
  ['emailsms', 'Email & SMS'],
];

describe('SourcePill', () => {
  it.each(SOURCE_LABEL_MATRIX)(
    'renders the canonical label for source %s',
    (source, label) => {
      render(<SourcePill source={source} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );

  it.each(SOURCE_LABEL_MATRIX.map(([s]) => s))(
    'applies source-specific class for %s',
    (source) => {
      const { container } = render(<SourcePill source={source} />);
      expect(container.firstChild).toHaveClass(`source-${source}`);
    },
  );

  it('renders the override label when provided', () => {
    render(<SourcePill source="campaigns" label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.queryByText('Campaigns')).not.toBeInTheDocument();
  });

  it('renders a leading dot element', () => {
    const { container } = render(<SourcePill source="campaigns" />);
    expect(container.querySelector('.dot')).not.toBeNull();
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(
      <SourcePill source="campaigns" data-testid="t" aria-label="src" />,
    );
    expect(screen.getByTestId('t')).toHaveAttribute('aria-label', 'src');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(
      <SourcePill source="campaigns" className="custom" />,
    );
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying span', () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<SourcePill ref={ref} source="campaigns" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
