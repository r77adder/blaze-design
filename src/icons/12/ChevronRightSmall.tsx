import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ChevronRightSmall = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 12 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path d="M4 2L8 6L4 10" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
)

export default ChevronRightSmall
