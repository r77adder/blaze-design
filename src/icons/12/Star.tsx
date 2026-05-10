import { forwardRef, type SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: number;
}

const Star = forwardRef<SVGSVGElement, IconProps>(
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
        d="M6 1.2 7.55 4.34l3.46.5-2.5 2.44.59 3.45L6 9.1l-3.1 1.63.59-3.45L1 4.84l3.46-.5z"
        fill={color}
      />
    </svg>
  ),
);
Star.displayName = 'Star';
export default Star;
