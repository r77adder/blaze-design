import { forwardRef, type SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: number;
}

const Warning = forwardRef<SVGSVGElement, IconProps>(
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
        d="M6 1.2 11.2 10.4H0.8z"
        stroke={color}
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M6 4.8v2.4"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="6" cy="9" r="0.7" fill={color} />
    </svg>
  ),
);
Warning.displayName = 'Warning';
export default Warning;
