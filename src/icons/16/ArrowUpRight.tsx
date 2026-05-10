import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowUpRight = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M5.6386 5.22053L11.3199 5.22045M11.3199 5.22045L11.3199 10.821M11.3199 5.22045L4.72026 11.8201"
          stroke={color}
          strokeOpacity="1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowUpRight
