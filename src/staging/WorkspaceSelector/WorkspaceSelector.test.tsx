import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceSelector } from './WorkspaceSelector';

describe('WorkspaceSelector', () => {
  it('renders the workspace name', () => {
    render(<WorkspaceSelector workspaceName="Acme Co" />);
    expect(screen.getByText('Acme Co')).toBeInTheDocument();
  });

  it('renders the first letter of workspaceName as fallback when no src or fallback prop', () => {
    render(<WorkspaceSelector workspaceName="acme co" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('uses workspaceLogoFallback when provided (overrides default first letter)', () => {
    render(<WorkspaceSelector workspaceName="Radiant Health" workspaceLogoFallback="RH" />);
    expect(screen.getByText('RH')).toBeInTheDocument();
    expect(screen.queryByText('R')).toBeNull();
  });

  it('renders an img when workspaceLogoSrc is provided', () => {
    const { container } = render(
      <WorkspaceSelector workspaceName="Acme Co" workspaceLogoSrc="https://example.test/logo.png" />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', 'https://example.test/logo.png');
  });

  it('does not render the fallback letter when workspaceLogoSrc is provided', () => {
    render(
      <WorkspaceSelector
        workspaceName="Acme Co"
        workspaceLogoSrc="https://example.test/logo.png"
        workspaceLogoFallback="A"
      />,
    );
    expect(screen.queryByText('A')).toBeNull();
  });

  it('applies workspaceLogoBg as inline background style on the logo button', () => {
    const { container } = render(
      <WorkspaceSelector workspaceName="Acme Co" workspaceLogoBg="rgb(255, 0, 0)" />,
    );
    const logoButton = container.querySelector('[class*="workspaceLogoButton"]') as HTMLElement;
    expect(logoButton).not.toBeNull();
    expect(logoButton.style.background).toBe('rgb(255, 0, 0)');
  });

  it('fires onPress when clicked', () => {
    const onPress = jest.fn();
    render(<WorkspaceSelector workspaceName="Acme Co" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires onPress when Enter is pressed', () => {
    const onPress = jest.fn();
    render(<WorkspaceSelector workspaceName="Acme Co" onPress={onPress} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires onPress when Space is pressed', () => {
    const onPress = jest.fn();
    render(<WorkspaceSelector workspaceName="Acme Co" onPress={onPress} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes aria-haspopup="menu" so AT recognizes the trigger', () => {
    render(<WorkspaceSelector workspaceName="Acme Co" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('forwards arbitrary HTML attributes via ...rest', () => {
    render(<WorkspaceSelector workspaceName="Acme Co" data-testid="t" aria-label="Switch workspace" />);
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('aria-label', 'Switch workspace');
  });

  it('merges consumer className with base classes', () => {
    const { container } = render(
      <WorkspaceSelector workspaceName="Acme Co" className="custom" />,
    );
    expect(container.firstChild).toHaveClass('root');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards ref to the underlying div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<WorkspaceSelector workspaceName="Acme Co" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
