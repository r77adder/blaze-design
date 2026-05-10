import { forwardRef } from 'react';
import type { SourceName, SourcePillProps } from './Types';
import styles from './SourcePill.module.scss';

const SOURCE_LABELS: Record<SourceName, string> = {
  campaigns: 'Campaigns',
  seoaeo: 'SEO/AEO',
  organicsocial: 'Organic Social',
  ugc: 'UGC Content',
  mapranking: 'Map Ranking',
  landingpages: 'Landing Pages',
  paidsearch: 'Paid Search',
  paidsocial: 'Paid Social',
  reputation: 'Reputation',
  emailsms: 'Email & SMS',
};

export const SourcePill = forwardRef<HTMLSpanElement, SourcePillProps>(
  ({ source, label, className, ...rest }, ref) => {
    const classes = [styles.root, styles[`source-${source}`], className]
      .filter(Boolean)
      .join(' ');
    return (
      <span ref={ref} className={classes} {...rest}>
        <span className={styles.dot} aria-hidden="true" />
        {label ?? SOURCE_LABELS[source]}
      </span>
    );
  },
);
SourcePill.displayName = 'SourcePill';
