import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * ToolsContext — H2-scoped state for which "tools" (sidebar entries under
 * Demand Gen + Conversion) are enabled for the current workspace. Driven by
 * the /h2/tools settings page; H2Layout reads it to filter sidebar sections.
 *
 * Local state only (in-memory, no persistence) — this is a prototype.
 */

export type ToolId =
  | 'Organic Campaigns'
  | 'SEO/AEO'
  | 'Map Ranking'
  | 'UGC Content'
  | 'Paid Social'
  | 'Paid Search'
  | 'Email & SMS'
  | 'Landing Pages'
  | 'CRM'
  | 'Reputation';

export type BusinessType = 'services' | 'local' | 'products';

export const DEMAND_GEN_TOOLS: ToolId[] = [
  'Organic Campaigns',
  'SEO/AEO',
  'Map Ranking',
  'UGC Content',
  'Paid Social',
  'Paid Search',
  'Email & SMS',
];

export const CONVERSION_TOOLS: ToolId[] = ['Landing Pages', 'CRM', 'Reputation'];

export const ALL_TOOLS: ToolId[] = [...DEMAND_GEN_TOOLS, ...CONVERSION_TOOLS];

export const TOOL_DESCRIPTIONS: Record<ToolId, string> = {
  'Organic Campaigns': 'Schedule and publish to Instagram, TikTok, LinkedIn, and more.',
  'SEO/AEO': 'Rank in Google and answer engines like ChatGPT and Perplexity.',
  'Map Ranking': 'Climb in local map results and Google Business listings.',
  'UGC Content': 'Generate AI avatar videos and creator-style ad content.',
  'Paid Social': 'Run and optimize paid campaigns across Meta, TikTok, and LinkedIn.',
  'Paid Search': 'Manage Google Ads keywords, bids, and conversion tracking.',
  'Email & SMS': 'Build automated drip sequences and broadcast campaigns.',
  'Landing Pages': 'Spin up high-converting pages tied to your campaigns.',
  CRM: 'Track deals through your pipeline with an AI SDR agent that drafts replies, sends follow-ups, and qualifies leads.',
  Reputation: 'Monitor and respond to reviews across Google, Yelp, and more.',
};

export const BUSINESS_TYPES: { id: BusinessType; label: string; description: string }[] = [
  {
    id: 'services',
    label: 'Services',
    description: 'Consultants, agencies, B2B teams selling expertise.',
  },
  {
    id: 'local',
    label: 'Local Business',
    description: 'Restaurants, salons, brick-and-mortar storefronts.',
  },
  {
    id: 'products',
    label: 'Products',
    description: 'E-commerce, DTC brands, physical or digital products.',
  },
];

export const PRESETS: Record<BusinessType, ToolId[]> = {
  services: [
    'Organic Campaigns',
    'SEO/AEO',
    'UGC Content',
    'Paid Search',
    'Email & SMS',
    'Landing Pages',
    'CRM',
    'Reputation',
  ],
  local: [
    'Organic Campaigns',
    'Map Ranking',
    'UGC Content',
    'Paid Social',
    'Email & SMS',
    'Landing Pages',
    'CRM',
    'Reputation',
  ],
  products: [
    'Organic Campaigns',
    'SEO/AEO',
    'UGC Content',
    'Paid Social',
    'Paid Search',
    'Email & SMS',
    'Landing Pages',
    'CRM',
    'Reputation',
  ],
};

interface ToolsContextValue {
  enabled: Set<ToolId>;
  preset: BusinessType | null;
  isEnabled: (id: ToolId) => boolean;
  toggle: (id: ToolId) => void;
  applyPreset: (p: BusinessType) => void;
}

const ToolsContext = createContext<ToolsContextValue | null>(null);

export function ToolsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<Set<ToolId>>(() => new Set(ALL_TOOLS));
  const [preset, setPreset] = useState<BusinessType | null>(null);

  const isEnabled = useCallback((id: ToolId) => enabled.has(id), [enabled]);

  const toggle = useCallback((id: ToolId) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPreset(null);
  }, []);

  const applyPreset = useCallback((p: BusinessType) => {
    setEnabled(new Set(PRESETS[p]));
    setPreset(p);
  }, []);

  const value = useMemo<ToolsContextValue>(
    () => ({ enabled, preset, isEnabled, toggle, applyPreset }),
    [enabled, preset, isEnabled, toggle, applyPreset],
  );

  return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>;
}

export function useTools(): ToolsContextValue {
  const ctx = useContext(ToolsContext);
  if (!ctx) throw new Error('useTools must be used inside <ToolsProvider>');
  return ctx;
}
