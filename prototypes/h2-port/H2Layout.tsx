import { useEffect, type ReactNode } from 'react';
import { useWorkspaceChrome } from '../blaze-dfy/nav';

/**
 * Faithful-port shim. blaze-dfy's WorkspaceShell owns the sidebar + topbar, so
 * the H2 layout renders only the page body — and pushes the page's own topbar
 * chrome UP into the WorkspaceShell topbar via the workspace-chrome context:
 *   - `topbarCenter` (+ a `title` node, when a page tucks a tab there) → topbar
 *     center, beside the section name.
 *   - `topbarRight` (page actions like "Generate report") → next to the
 *     AM/Client switch.
 * A plain-string `title` is dropped (the topbar already shows the section name).
 */
export interface H2LayoutProps {
  children: ReactNode;
  title?: string | ReactNode;
  topbarRight?: ReactNode;
  topbarCenter?: ReactNode;
  fullBleed?: boolean;
  /** Replace the topbar's left section name with this node (e.g. a back +
   *  page-title cluster on a settings/detail page). Unlike `title`, which
   *  renders in the center beside the section name, this swaps the section
   *  name itself. */
  titleOverride?: ReactNode;
}

export function H2Layout({ children, title, topbarCenter, topbarRight, fullBleed, titleOverride }: H2LayoutProps) {
  const chrome = useWorkspaceChrome();
  const titleNode = title != null && typeof title !== 'string' ? title : null;
  const center = titleNode || topbarCenter ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      {titleNode}
      {topbarCenter}
    </div>
  ) : null;

  // Keep the topbar in sync on every render (re-runs when the page's own tab
  // state changes). Safe from loops: WorkspaceShell re-renders don't re-render
  // this stable child, so the effect only fires on the page's own updates.
  useEffect(() => {
    chrome?.setTopbarCenter(center);
    chrome?.setTopbarRight(topbarRight ?? null);
    chrome?.setFullBleed(!!fullBleed);
    chrome?.setTitle(titleOverride ?? null);
  });
  // Clear when the page unmounts (e.g. navigating to another section).
  useEffect(() => () => {
    chrome?.setTopbarCenter(null);
    chrome?.setTopbarRight(null);
    chrome?.setFullBleed(false);
    chrome?.setTitle(null);
  }, [chrome]);

  return children as ReactNode;
}
