import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowSwitchVertical = forwardRef<SVGSVGElement, IconProps>(
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
          d="M11.875 5.3125L14.6875 2.5M14.6875 2.5L17.5 5.3125M14.6875 2.5L14.6875 17.5M8.125 14.6875L5.3125 17.5M5.3125 17.5L2.5 14.6875M5.3125 17.5L5.3125 2.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowSwitchVertical
