import type { ReactNode } from 'react';
import styles from './PrototypeShell.module.scss';
import { Sidebar, type SidebarNavItem, type SidebarSection } from './Sidebar';
import { TopBar } from './TopBar';
import { StatePickerControls } from './StatePicker';

export interface PrototypeShellProps {
  title: string;
  topbarRight?: ReactNode;
  /** Sectioned sidebar (Demand Gen / Conversion / Settings shape). Wins
   *  over `sidebarItems` when both are passed. */
  sidebarSections?: SidebarSection[];
  /** Legacy flat list for prototypes that don't need sections. */
  sidebarItems?: SidebarNavItem[];
  sidebarActiveLabel?: string;
  /** Workspace name shown in the sidebar header. Defaults to "Acme Co". */
  workspaceName?: string;
  children: ReactNode;
}

export function PrototypeShell({
  title,
  topbarRight,
  sidebarSections,
  sidebarItems,
  sidebarActiveLabel,
  workspaceName,
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
        <TopBar title={title} rightContent={topbarRight ?? <StatePickerControls />} />
        <section className={styles.content}>{children}</section>
      </div>
    </div>
  );
}
