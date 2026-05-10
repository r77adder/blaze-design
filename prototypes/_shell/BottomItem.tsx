import type { ComponentType, MouseEvent, ReactNode } from 'react';
import styles from './BottomItem.module.scss';

/**
 * Compact link/button row for the sidebar footer.
 *
 * Faithful port of prod's
 *   apps/blaze/src/blaze-components/WorkspaceDashboardSidebar/components/BottomItem/BottomItem.tsx
 * stripped per CONVENTIONS strip-list (no `react-aria` button/hover/focus
 * wrappers — native `<button>` semantics suffice for the prototype layer).
 *
 * Renders a 25px-tall row with a 16px icon and an `xs-sohne-book` label.
 * Lives in `prototypes/_shell/` rather than the lib because it's chrome-only
 * (no current second consumer); promote to `src/components/BottomItem/`
 * when a non-prototype caller needs it.
 */
interface BottomItemProps {
  icon: ComponentType<{ size?: number }>;
  children: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

export function BottomItem({ icon: Icon, children, href, onClick }: BottomItemProps) {
  const inner = (
    <>
      <span className={styles.icon}>
        <Icon size={16} />
      </span>
      <span className={styles.text}>{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        className={styles.root}
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={styles.root} onClick={onClick}>
      {inner}
    </button>
  );
}
