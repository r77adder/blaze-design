import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';
import type { AvatarSize } from './Types';

describe('Avatar', () => {
  it('renders the fallback initials when no src is provided', () => {
    render(<Avatar fallback="FH" />);
    expect(screen.getByText('FH')).toBeInTheDocument();
  });

  it('renders an img when src is provided and not the fallback', () => {
    render(<Avatar src="https://example.com/me.png" alt="Me" fallback="FH" />);
    const img = screen.getByRole('img', { name: 'Me' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/me.png');
    expect(screen.queryByText('FH')).not.toBeInTheDocument();
  });

  it('forwards alt to the img tag', () => {
    render(<Avatar src="x.png" alt="Profile" fallback="FH" />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Profile');
  });

  it('renders an empty alt when no alt is provided', () => {
    const { container } = render(<Avatar src="x.png" fallback="FH" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
  });

  it.each<AvatarSize>(['sm', 'md', 'lg'])(
    'applies size class for %s',
    (size) => {
      const { container } = render(<Avatar size={size} fallback="FH" />);
      expect(container.firstChild).toHaveClass(`size-${size}`);
    },
  );

  it('defaults to size md', () => {
    const { container } = render(<Avatar fallback="FH" />);
    expect(container.firstChild).toHaveClass('size-md');
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(<Avatar data-testid="t" aria-label="profile" fallback="FH" />);
    expect(screen.getByTestId('t')).toHaveAttribute('aria-label', 'profile');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(<Avatar className="custom" fallback="FH" />);
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Avatar ref={ref} fallback="FH" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
