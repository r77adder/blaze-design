import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Close = forwardRef<SVGSVGElement, IconProps>(
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
        <path d="M15 5L5 15M15 15L5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
)

export default Close
