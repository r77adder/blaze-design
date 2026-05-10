// Static label chip — mirrors prod's apps/blaze/src/components/Pill/Pill.tsx
// (a div with a size class). Interactive selectable/deletable chips live in
// the Chip component; that's how prod splits them too. See CONVENTIONS.md.
import type { HTMLAttributes } from 'react';

export type PillSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface PillProps extends HTMLAttributes<HTMLDivElement> {
  size?: PillSize;
}
