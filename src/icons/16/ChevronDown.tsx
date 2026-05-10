import { forwardRef, type SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: number;
}

// Translated from prod's 20px ChevronDown (apps/blaze/src/blaze-ui/icons/20/ChevronDown.tsx)
// scaled 0.8x for 16px viewBox.
const ChevronDown = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16, ...rest }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M4 6.4L8.0006 10.064L12 6.4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
);
ChevronDown.displayName = 'ChevronDown';
export default ChevronDown;
