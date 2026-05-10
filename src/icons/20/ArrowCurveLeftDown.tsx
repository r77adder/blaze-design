import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowCurveLeftDown = forwardRef<SVGSVGElement, IconProps>(
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
          d="M7.92834 16.5L3.5 12.0717M3.5 12.0717L7.92834 7.64332M3.5 12.0717H13.5C15.7091 12.0717 17.5 10.2808 17.5 8.07166V3.5"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowCurveLeftDown
