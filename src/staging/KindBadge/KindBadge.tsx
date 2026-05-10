import { forwardRef, type ComponentType } from 'react';
import type { KindBadgeKind, KindBadgeProps } from './Types';
import Star from '../../icons/12/Star';
import Warning from '../../icons/12/Warning';
import styles from './KindBadge.module.scss';

const KIND_LABELS: Record<KindBadgeKind, string> = {
  action: 'Action needed',
  alert: 'Heads up',
  insight: 'Insight',
};

const KIND_ICONS: Record<
  KindBadgeKind,
  ComponentType<{ size?: number }> | null
> = {
  action: Star,
  alert: Warning,
  insight: null,
};

export const KindBadge = forwardRef<HTMLSpanElement, KindBadgeProps>(
  ({ kind, label, className, ...rest }, ref) => {
    const classes = [styles.root, styles[`kind-${kind}`], className]
      .filter(Boolean)
      .join(' ');
    const Icon = KIND_ICONS[kind];
    return (
      <span ref={ref} className={classes} {...rest}>
        {Icon ? (
          <span className={styles.icon}>
            <Icon size={11} />
          </span>
        ) : null}
        {label ?? KIND_LABELS[kind]}
      </span>
    );
  },
);
KindBadge.displayName = 'KindBadge';
