import type { Account, BrandScan, PhaseProgress, PhaseId } from './types';

/* The grain-design-flooring account, copied verbatim from
 * prototypes/blaze-dfy/lib/fixtures/accounts.ts, with the phases() + emptyDocs()
 * helpers it depends on. This is the account the client strategy review renders. */

function phases(current: PhaseId, status: 'not_started' | 'in_progress' | 'complete'): PhaseProgress[] {
  const names: Record<PhaseId, string> = {
    1: 'Registration',
    2: 'Strategy',
    3: 'Creative Review',
  };
  return ([1, 2, 3] as PhaseId[]).map((id) => ({
    id,
    name: names[id],
    status:
      id < current ? 'complete' : id > current ? 'not_started' : status,
  }));
}

const emptyDocs = (): BrandScan['docs'] => [
  { id: 'guidelines', label: 'Brand guidelines', kind: 'Brand guidelines', status: 'empty' },
  { id: 'tone', label: 'Tone of voice', kind: 'Tone of voice', status: 'empty' },
  { id: 'avoid', label: 'Words / phrases to avoid', kind: 'Words to avoid', status: 'empty' },
  { id: 'photos', label: 'Photos', kind: 'Photos', status: 'empty' },
  { id: 'audiences', label: 'Target audiences', kind: 'Target audiences', status: 'empty' },
];

export const GRAIN_ACCOUNT: Account = {
  id: 'grain-design-flooring',
  name: 'Grain Design Flooring',
  industry: 'Hardwood & luxury vinyl flooring',
  location: 'Naperville, IL',
  website: 'graindesignflooring.com',
  domain: 'graindesignflooring.com',
  accent: '#8B6914',
  poc: { name: 'Tyler Novak', email: 'tyler@graindesignflooring.com', phone: '(630) 555-0187', role: 'Owner' },
  am: { name: 'Dana Whitfield', initials: 'DW' },
  status: 'onboarding',
  invitedDaysAgo: 4,
  invitedDate: '2026-06-25',
  phase: 2,
  stepLabel: 'Strategy, Competitive scorecard',
  progressPct: 30,
  aiNextStep: 'Complete the competitive scorecard setup for Tyler: website, GBP, and confirm the local competitors.',
  phases: phases(2, 'in_progress'),
  brand: {
    website: 'graindesignflooring.com',
    logos: [{ id: 'primary', bg: '#8B6914', label: 'Primary' }],
    fonts: [
      { family: 'Playfair Display', role: 'Display' },
      { family: 'Inter', role: 'Body' },
    ],
    colors: [
      { hex: '#8B6914', name: 'Walnut' },
      { hex: '#2C2317', name: 'Espresso' },
      { hex: '#F5EFE6', name: 'Birch' },
      { hex: '#9E8B7D', name: 'Driftwood' },
    ],
    docs: emptyDocs().map((d) =>
      d.id === 'photos' ? { ...d, fileName: 'showroom-photos.zip', status: 'uploaded' } : d,
    ),
  },
};
