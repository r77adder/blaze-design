import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const SortVertical03 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M4.95913 15.8727V5.87265M4.95913 5.87265L8.13049 8.92955M4.95913 5.87265L1.66666 8.92955"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.2012 6.39532H18.3333M11.2012 10.4076H16.2955M11.2012 14.42H14.2578"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default SortVertical03
