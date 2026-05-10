import type { Story, StoryDefault } from '@ladle/react';
import { SourcePill } from './SourcePill';
import type { SourceName } from './Types';

export default { title: 'Components / SourcePill' } as StoryDefault;

const ALL_SOURCES: SourceName[] = [
  'campaigns',
  'seoaeo',
  'organicsocial',
  'ugc',
  'mapranking',
  'landingpages',
  'paidsearch',
  'paidsocial',
  'reputation',
  'emailsms',
];

export const Default: Story = () => <SourcePill source="campaigns" />;

export const AllSources: Story = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {ALL_SOURCES.map((s) => (
      <SourcePill key={s} source={s} />
    ))}
  </div>
);

export const CustomLabel: Story = () => (
  <SourcePill source="seoaeo" label="Search & Answer Engines" />
);
