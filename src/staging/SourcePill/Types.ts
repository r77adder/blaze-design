import type { HTMLAttributes } from 'react';

// Canonical Blaze surface keys. The pill resolves bg/fg from
// `--source-<name>-bg/-fg` tokens in src/tokens/colors.css.
export type SourceName =
  | 'campaigns'
  | 'seoaeo'
  | 'organicsocial'
  | 'ugc'
  | 'mapranking'
  | 'landingpages'
  | 'paidsearch'
  | 'paidsocial'
  | 'reputation'
  | 'emailsms';

// SourcePill is a static label, no children — the label is fully derived from
// `source` (canonical) or overridden via `label`. Children are intentionally
// omitted from the public surface.
export interface SourcePillProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Which Blaze surface this item came from. Drives color and default label. */
  source: SourceName;
  /** Override the canonical label. Defaults to a per-source human label. */
  label?: string;
}
