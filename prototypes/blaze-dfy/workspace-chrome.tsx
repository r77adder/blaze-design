import { createContext, useContext, type ReactNode } from 'react';

/**
 * Standalone home for the workspace-chrome context so both `nav.tsx`
 * (the provider) and feature pages (Approvals, ported H2 pages, Scorecard)
 * can import the hook without creating an import cycle.
 */
export interface WorkspaceChrome {
  setTopbarCenter: (n: ReactNode) => void;
  setTopbarRight: (n: ReactNode) => void;
  setFullBleed: (b: boolean) => void;
  // Lets a page replace the topbar's left title (the section name) with its own
  // node, e.g. a detail/settings page swapping the section name for a back +
  // page-title cluster. Null restores the default section name.
  setTitle: (n: ReactNode) => void;
}

export const WorkspaceChromeContext = createContext<WorkspaceChrome | null>(null);
export const useWorkspaceChrome = () => useContext(WorkspaceChromeContext);
