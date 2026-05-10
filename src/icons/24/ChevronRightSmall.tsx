import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ChevronRightSmall = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M10 7L15 12L10 17"
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

export default ChevronRightSmall
