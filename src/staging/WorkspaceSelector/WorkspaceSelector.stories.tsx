import type { Story, StoryDefault } from '@ladle/react';
import { WorkspaceSelector } from './WorkspaceSelector';

export default { title: 'Components / WorkspaceSelector' } as StoryDefault;

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 220, padding: 12, background: 'var(--dark-2)' }}>{children}</div>
);

export const Default: Story = () => wrap(<WorkspaceSelector workspaceName="Acme Co" />);

export const WithFallbackLetter: Story = () =>
  wrap(<WorkspaceSelector workspaceName="Blaze HQ" />);

export const WithCustomFallback: Story = () =>
  wrap(
    <WorkspaceSelector
      workspaceName="Radiant Health"
      workspaceLogoFallback="RH"
      workspaceLogoBg="var(--purple)"
    />,
  );

export const WithImage: Story = () =>
  wrap(
    <WorkspaceSelector
      workspaceName="Almanac"
      workspaceLogoSrc="https://res.cloudinary.com/almanac/image/upload/v1763501162/blaze_assets/blaze-logo_vzlsxy.jpg"
    />,
  );

export const WithOnPress: Story = () =>
  wrap(
    <WorkspaceSelector
      workspaceName="Acme Co"
      onPress={() => alert('clicked workspace selector')}
    />,
  );

export const LongName: Story = () =>
  wrap(
    <WorkspaceSelector workspaceName="A Very Long Workspace Name That Will Truncate" />,
  );
