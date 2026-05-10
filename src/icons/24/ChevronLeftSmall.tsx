import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ChevronLeftSmall = forwardRef<SVGSVGElement, IconProps>(
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
          d="M14 7L9 12L14 17"
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

export default ChevronLeftSmall
