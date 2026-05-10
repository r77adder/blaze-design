import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowExpand1 = forwardRef<SVGSVGElement, IconProps>(
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
          d="M6.66667 16.6667H3.33333M3.33333 16.6667V13.3333M3.33333 16.6667L7.08333 12.9167M13.3333 3.33333H16.6667M16.6667 3.33333V6.66667M16.6667 3.33333L12.9167 7.08333M3.33333 6.66667L3.33333 3.33333M3.33333 3.33333L6.66667 3.33333M3.33333 3.33333L7.08333 7.08333M16.6667 13.3333L16.6667 16.6667M16.6667 16.6667H13.3333M16.6667 16.6667L12.9167 12.9167"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowExpand1
