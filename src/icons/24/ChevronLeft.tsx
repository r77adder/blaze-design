import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ChevronLeft = forwardRef<SVGSVGElement, IconProps>(
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
          d="M15 19L8 12L15 5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ChevronLeft
