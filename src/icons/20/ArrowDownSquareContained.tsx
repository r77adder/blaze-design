import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowDownSquareContained = forwardRef<SVGSVGElement, IconProps>(
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
          d="M13.3146 10.5199L10 13.75M10 13.75L6.68546 10.5199M10 13.75L10 6.65292M5.3125 2.5L14.6876 2.5C16.2409 2.5 17.5001 3.7592 17.5001 5.3125L17.5001 14.6875C17.5001 16.2408 16.2409 17.5 14.6876 17.5L5.3125 17.5C3.7592 17.5 2.5 16.2408 2.5 14.6875L2.5 5.3125C2.5 3.7592 3.7592 2.5 5.3125 2.5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowDownSquareContained
