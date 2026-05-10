import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Check2 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, 'aria-label': ariaLabel }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
        aria-label={ariaLabel}
      >
        <path
          d="M3.33333 10.6863C4.65465 11.6013 7.2973 14.1176 8.37838 15.8333C9.6997 13.0882 13.0631 6.91176 16.6667 4.16667"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default Check2
