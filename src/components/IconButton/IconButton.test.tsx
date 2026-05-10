import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';
import { IconButtonLink } from './IconButtonLink';
import { MemoryRouter } from 'react-router-dom';
import type { Icon } from '../../icons/Types';

const StubIcon: Icon = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} data-testid="stub-icon" {...rest} />
);

describe('IconButton', () => {
  it('renders the icon when no children are provided', () => {
    const { getByTestId } = render(<IconButton icon={StubIcon} title="Edit" />);
    expect(getByTestId('stub-icon')).toBeInTheDocument();
  });

  it('renders children when no icon is provided', () => {
    const { getByText } = render(<IconButton title="Save">Save</IconButton>);
    expect(getByText('Save')).toBeVisible();
  });

  it('forwards onPress to the underlying Button', async () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <IconButton icon={StubIcon} title="Edit" onPress={onPress} />,
    );
    await userEvent.click(getByRole('button', { name: 'Edit' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('applies the active prop as forceActive on the underlying Button', () => {
    const { getByRole } = render(
      <IconButton icon={StubIcon} title="Toggle" active />,
    );
    expect(getByRole('button', { name: 'Toggle' }).className).toMatch(/pressed/);
  });
});

describe('IconButtonLink', () => {
  it('renders a link with the icon when no children are provided', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <IconButtonLink icon={StubIcon} title="Open" to="/somewhere" />
      </MemoryRouter>,
    );
    const link = getByRole('link', { name: 'Open' });
    expect(link).toHaveAttribute('href', '/somewhere');
  });

  it('renders a chevron when withChevron is set', () => {
    const { container } = render(
      <MemoryRouter>
        <IconButtonLink icon={StubIcon} title="Menu" to="/" withChevron="down" />
      </MemoryRouter>,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(1);
  });
});
