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
 * State model: TWO sets — `enabled` is the committed source of truth that
 * downstream consumers (sidebar filter) read; `draft` is the in-flight set
 * the Meta Strategy page mutates as the user toggles rows. The Meta Strategy
 * page renders a Save/Discard footer when the two diverge. Presets are
 * "fully-formed configurations" — applying one commits both sets at once.
 *
 * Local state only (in-memory, no persistence) — this is a prototype.
 */

export type ToolId =
  | 'Organic Campaigns'
  | 'SEO'
  | 'AEO'
  | 'UGC Content'
  | 'Paid Social'
  | 'Paid Search'
  | 'Landing Pages'
  | 'SDR'
  | 'Reputation';

export type BusinessType = 'services' | 'local' | 'products';

export const DEMAND_GEN_TOOLS: ToolId[] = [
  'Organic Campaigns',
  'SEO',
  'AEO',
  'UGC Content',
  'Paid Social',
  'Paid Search',
];

export const CONVERSION_TOOLS: ToolId[] = ['Landing Pages', 'SDR', 'Reputation'];

export const ALL_TOOLS: ToolId[] = [...DEMAND_GEN_TOOLS, ...CONVERSION_TOOLS];

export const TOOL_DESCRIPTIONS: Record<ToolId, string> = {
  'Organic Campaigns': 'Schedule and publish to Instagram, TikTok, LinkedIn, and more.',
  SEO: 'Rank on Google with topic-cluster blog content.',
  AEO: 'Get cited by ChatGPT, Perplexity, and other answer engines. Includes local Map Ranking for Google Business listings.',
  'UGC Content': 'Generate AI avatar videos and creator-style ad content.',
  'Paid Social': 'Run and optimize paid campaigns across Meta, TikTok, and LinkedIn.',
  'Paid Search': 'Manage Google Ads keywords, bids, and conversion tracking.',
  'Landing Pages': 'Spin up high-converting pages tied to your campaigns.',
  SDR: 'Combined outreach pipeline — email, SMS, and CRM in one workflow, orchestrated by an AI Receptionist agent.',
  Reputation: 'Monitor and respond to reviews across Google, Yelp, and more.',
};

export const TOOL_LABEL: Record<ToolId, string> = {
  'Organic Campaigns': 'Organic Campaigns',
  SEO: 'SEO',
  AEO: 'AEO',
  'UGC Content': 'UGC Content',
  'Paid Social': 'Paid Social',
  'Paid Search': 'Paid Search',
  'Landing Pages': 'Landing Pages',
  SDR: 'AI Receptionist',
  Reputation: 'Reputation',
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

// Presets are fully-formed configurations the user opts into. They include
// every tool the preset's audience usually wants — including UGC. The default
// initial state (before any preset is picked) is a separate concern — see
// `DEFAULT_ENABLED` below, which deliberately excludes UGC so it's an opt-in.
export const PRESETS: Record<BusinessType, ToolId[]> = {
  services: [
    'Organic Campaigns',
    'SEO',
    'AEO',
    'UGC Content',
    'Paid Search',
    'Landing Pages',
    'SDR',
    'Reputation',
  ],
  local: [
    'Organic Campaigns',
    'AEO',
    'UGC Content',
    'Paid Social',
    'Landing Pages',
    'SDR',
    'Reputation',
  ],
  products: [
    'Organic Campaigns',
    'SEO',
    'AEO',
    'UGC Content',
    'Paid Social',
    'Paid Search',
    'Landing Pages',
    'SDR',
    'Reputation',
  ],
};

// Initial default — every tool EXCEPT UGC Content. UGC is opt-in via the
// Meta Strategy page so new workspaces don't surface an entry they haven't
// configured yet.
const DEFAULT_ENABLED: ToolId[] = ALL_TOOLS.filter((id) => id !== 'UGC Content');

function setsEqual(a: Set<ToolId>, b: Set<ToolId>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

interface ToolsContextValue {
  enabled: Set<ToolId>;
  preset: BusinessType | null;
  isEnabled: (id: ToolId) => boolean;
  /** Read the in-flight draft value — used by the Meta Strategy toggles so
   *  the UI reflects the user's pending intent without committing it. */
  isDraftEnabled: (id: ToolId) => boolean;
  /** True when the draft set differs from the committed `enabled` set. */
  hasUnsavedChanges: boolean;
  /** Mutates the draft only — commit happens via `saveChanges()`. */
  toggle: (id: ToolId) => void;
  /** One-shot enable: commits immediately to both draft and `enabled`.
   *  Used by surfaces outside the Meta Strategy toggles (e.g. the Business
   *  Scorecard "Turn on Feature" CTA) so the user doesn't have to detour
   *  to the toggles + Save flow. */
  enable: (id: ToolId) => void;
  /** Commits draft → enabled. Downstream consumers (sidebar filter) update. */
  saveChanges: () => void;
  /** Resets draft to current committed `enabled` set. */
  discardChanges: () => void;
  /** Applies a preset to BOTH draft and committed state simultaneously —
   *  presets are fully-formed configurations, not pending edits. */
  applyPreset: (p: BusinessType) => void;
}

const ToolsContext = createContext<ToolsContextValue | null>(null);

export function ToolsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<Set<ToolId>>(() => new Set(DEFAULT_ENABLED));
  const [draft, setDraft] = useState<Set<ToolId>>(() => new Set(DEFAULT_ENABLED));
  const [preset, setPreset] = useState<BusinessType | null>(null);

  const isEnabled = useCallback((id: ToolId) => enabled.has(id), [enabled]);
  const isDraftEnabled = useCallback((id: ToolId) => draft.has(id), [draft]);
  const hasUnsavedChanges = useMemo(() => !setsEqual(draft, enabled), [draft, enabled]);

  const toggle = useCallback((id: ToolId) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPreset(null);
  }, []);

  const enable = useCallback((id: ToolId) => {
    setEnabled((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setDraft((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPreset(null);
  }, []);

  const saveChanges = useCallback(() => {
    setEnabled(new Set(draft));
  }, [draft]);

  const discardChanges = useCallback(() => {
    setDraft(new Set(enabled));
  }, [enabled]);

  const applyPreset = useCallback((p: BusinessType) => {
    const next = new Set(PRESETS[p]);
    setEnabled(next);
    setDraft(new Set(next));
    setPreset(p);
  }, []);

  const value = useMemo<ToolsContextValue>(
    () => ({
      enabled,
      preset,
      isEnabled,
      isDraftEnabled,
      hasUnsavedChanges,
      toggle,
      enable,
      saveChanges,
      discardChanges,
      applyPreset,
    }),
    [
      enabled,
      preset,
      isEnabled,
      isDraftEnabled,
      hasUnsavedChanges,
      toggle,
      enable,
      saveChanges,
      discardChanges,
      applyPreset,
    ],
  );

  return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>;
}

export function useTools(): ToolsContextValue {
  const ctx = useContext(ToolsContext);
  if (!ctx) throw new Error('useTools must be used inside <ToolsProvider>');
  return ctx;
}
