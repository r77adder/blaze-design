import type { SVGAttributes } from 'react';

export type LogoVariant = 'full' | 'mark';

export interface LogoProps extends SVGAttributes<SVGSVGElement> {
  variant?: LogoVariant;
  size?: number;
}
