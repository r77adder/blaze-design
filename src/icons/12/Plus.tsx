import { forwardRef, type SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: number;
}

const Plus = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 12, ...rest }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M6 2.4V9.6M9.6 6H2.4"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
);
Plus.displayName = 'Plus';
export default Plus;
