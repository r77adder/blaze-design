import { forwardRef, type SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: number;
}

const BarChartSquareFilled = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, ...rest }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      {...rest}
    >
      <path
        d="M14 14V9M10 14V6M6 14V12M4 18C2.89543 18 2 17.1046 2 16V4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V16C18 17.1046 17.1046 18 16 18H4Z"
        stroke={color}
        strokeOpacity="0.6"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill={color}
        fillOpacity="0.15"
        strokeLinejoin="round"
      />
    </svg>
  ),
);
BarChartSquareFilled.displayName = 'BarChartSquareFilled';
export default BarChartSquareFilled;
