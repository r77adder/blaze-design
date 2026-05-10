import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const SortVertical02 = forwardRef<SVGSVGElement, IconProps>(
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
          d="M11.2012 6.39542H18.3333M11.2012 10.4077H16.2956M11.2012 14.42H14.2578M4.83804 5.87265V15.8727M4.83804 15.8727L1.66667 12.8158M4.83804 15.8727L8.13051 12.8158"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default SortVertical02
