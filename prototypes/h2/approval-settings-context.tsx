import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Single source of truth for approval settings across the H2 prototype.
 *
 * The Approval Settings modal (on the Approvals page) is the ONLY control that
 * mutates this — other surfaces (e.g. SEO/AEO "Blog post settings") read it to
 * show the resulting publishing status and link back to the modal. Keeping the
 * state here is what lets us drop the duplicate toggle from those pages.
 *
 * Keys mirror CONTENT_TYPES in pages/ApprovalsV2.tsx.
 */
export type ApprovalFeatureKey =
  | 'campaigns'
  | 'seo-blogs'
  | 'reputation'
  | 'paid-ads'
  | 'paid-social';

const DEFAULTS: Record<ApprovalFeatureKey, boolean> = {
  campaigns: false,
  'seo-blogs': false,
  reputation: true,
  'paid-ads': true,
  'paid-social': true,
};

interface ApprovalSettingsValue {
  /** Master switch — when off, everything publishes automatically. */
  approvalsOn: boolean;
  setApprovalsOn: (v: boolean) => void;
  /** Per-feature "requires approval" flags. */
  requiresApproval: Record<string, boolean>;
  setFeature: (key: string, v: boolean) => void;
  /** True when the given feature needs sign-off before publishing. */
  featureRequiresApproval: (key: string) => boolean;
}

const ApprovalSettingsContext = createContext<ApprovalSettingsValue | null>(null);

export function ApprovalSettingsProvider({ children }: { children: ReactNode }) {
  const [approvalsOn, setApprovalsOn] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState<Record<string, boolean>>(() => ({ ...DEFAULTS }));

  const setFeature = (key: string, v: boolean) =>
    setRequiresApproval(prev => ({ ...prev, [key]: v }));

  const featureRequiresApproval = (key: string) => approvalsOn && !!requiresApproval[key];

  return (
    <ApprovalSettingsContext.Provider
      value={{ approvalsOn, setApprovalsOn, requiresApproval, setFeature, featureRequiresApproval }}
    >
      {children}
    </ApprovalSettingsContext.Provider>
  );
}

export function useApprovalSettings() {
  const ctx = useContext(ApprovalSettingsContext);
  if (!ctx) throw new Error('useApprovalSettings must be used within an ApprovalSettingsProvider');
  return ctx;
}
