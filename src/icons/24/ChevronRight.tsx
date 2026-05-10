import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ChevronRight = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24, strokeWidth = 1.5 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M9 19L16 12L9 5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ChevronRight
