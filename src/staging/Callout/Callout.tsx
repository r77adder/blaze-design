import { forwardRef } from 'react';
import type { CalloutProps } from './Types';
import styles from './Callout.module.scss';

/**
 * Inline info / warning / danger / success / neutral panel.
 *
 * Lighter-weight than a Toast — Toast floats, Callout sits in flow.
 * Use for: in-card explanations, setup-required banners, discrepancy
 * cards, "fix these issues" summaries. Pair with `<Toast>` (floating)
 * for transient feedback.
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  ({ tone = 'neutral', icon: Icon, title, children, className, ...rest }, ref) => {
    const classes = [styles.root, styles[`tone-${tone}`], className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...rest}>
        {Icon && (
          <span className={styles.iconSlot}>
            <Icon size={20} />
          </span>
        )}
        <div className={styles.body}>
          {title && <span className={styles.title}>{title}</span>}
          {children && <span className={styles.text}>{children}</span>}
        </div>
      </div>
    );
  },
);
Callout.displayName = 'Callout';
