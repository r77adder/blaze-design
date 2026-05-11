import type { NavItemTrailProps } from '../Types';
import styles from './Trail.module.scss';

/**
 * NavItem.Trail — small right-aligned text indicator. Used for things like
 * "Integrations 3/10" (Ivan's H2 sidebar). Free-form children, not numeric
 * like Counter.
 *
 * Source typography from Ivan's `.nav-trail` rule (Blaze H2 Features /index.html):
 *   font-size: 11px; font-weight: 400; color: var(--dark-40);
 */
export const Trail = ({ children, className, classNames, ...rest }: NavItemTrailProps) => {
  const classes = [styles.trail, className, classNames].filter(Boolean).join(' ');
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
};
Trail.displayName = 'NavItem.Trail';
