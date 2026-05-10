import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowRotateLeft2 = forwardRef<SVGSVGElement, IconProps>(
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
          d="M4.0593 12.0833C4.90761 14.7449 7.3372 16.6667 10.202 16.6667C13.7723 16.6667 16.6667 13.6819 16.6667 10C16.6667 6.3181 13.7723 3.33333 10.202 3.33333C7.80919 3.33333 5.72 4.674 4.60223 6.66667M4.0593 6.01537L4.94976 6.87507M6.56566 7.5H3.33333V4.16667L6.56566 7.5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowRotateLeft2
