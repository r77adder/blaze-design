import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowSwitchHorizontal = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M5.3125 8.125L2.5 5.3125M2.5 5.3125L5.3125 2.5M2.5 5.3125H17.5M14.6875 11.875L17.5 14.6875M17.5 14.6875L14.6875 17.5M17.5 14.6875H2.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowSwitchHorizontal
