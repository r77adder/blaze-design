import { forwardRef, type SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: number;
}

const Close = forwardRef<SVGSVGElement, IconProps>(
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
        d="M9 3L3 9M9 9L3 3"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
);
Close.displayName = 'Close';
export default Close;
