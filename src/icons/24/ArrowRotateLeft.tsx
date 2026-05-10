import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowRotateLeft = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
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
          d="M4.87115 14.5C5.88914 17.6939 8.80463 20 12.2424 20C16.5268 20 20 16.4183 20 12C20 7.58172 16.5268 4 12.2424 4C9.37103 4 6.86399 5.60879 5.52267 8M7.87879 9H4V5"
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

export default ArrowRotateLeft
