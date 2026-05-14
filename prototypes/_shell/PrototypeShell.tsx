import type { ReactNode } from 'react';
import styles from './PrototypeShell.module.scss';
import { Sidebar, type SidebarNavItem, type SidebarSection } from './Sidebar';
import { TopBar } from './TopBar';
import { StatePickerControls } from './StatePicker';

export interface PrototypeShellProps {
  /** String renders as the standard topbar title; a ReactNode renders as-is
   *  so prototypes can drop in custom left-aligned clusters (e.g. detail-view
   *  back-button + name + status pill). */
  title: string | ReactNode;
  topbarRight?: ReactNode;
  /** Optional content rendered in the topbar's center slot. Useful for
   *  page-level tab strips (e.g. General / Blogs). */
  topbarCenter?: ReactNode;
  /** Sectioned sidebar (Demand Gen / Conversion / Settings shape). Wins
   *  over `sidebarItems` when both are passed. */
  sidebarSections?: SidebarSection[];
  /** Legacy flat list for prototypes that don't need sections. */
  sidebarItems?: SidebarNavItem[];
  sidebarActiveLabel?: string;
  /** Workspace name shown in the sidebar header. Defaults to "Acme Co". */
  workspaceName?: string;
  /** Remove the default 24px content padding so the child can own the full
   *  area (used by detail views with their own internal chrome / sticky
   *  composers). */
  fullBleed?: boolean;
  children: ReactNode;
}

export function PrototypeShell({
  title,
  topbarRight,
  topbarCenter,
  sidebarSections,
  sidebarItems,
  sidebarActiveLabel,
  workspaceName,
  fullBleed,
  children,
}: PrototypeShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar
        sections={sidebarSections}
        items={sidebarItems}
        activeLabel={sidebarActiveLabel}
        workspaceName={workspaceName}
      />
      <div className={styles.main}>
        <TopBar
          title={title}
          centerContent={topbarCenter}
          rightContent={topbarRight ?? <StatePickerControls />}
        />
        <section className={fullBleed ? `${styles.content} ${styles.contentFullBleed}` : styles.content}>
          {children}
        </section>
      </div>
    </div>
  );
}
