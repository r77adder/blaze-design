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
}

export const WorkspaceChromeContext = createContext<WorkspaceChrome | null>(null);
export const useWorkspaceChrome = () => useContext(WorkspaceChromeContext);
