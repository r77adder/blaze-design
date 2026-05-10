import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowRotateRight = forwardRef<SVGSVGElement, IconProps>(
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
          d="M15.9407 12.0833C15.0924 14.7449 12.6628 16.6667 9.79804 16.6667C6.22773 16.6667 3.33333 13.6819 3.33333 10C3.33333 6.3181 6.22773 3.33333 9.79804 3.33333C12.1908 3.33333 14.28 4.674 15.3978 6.66667M15.9407 6.01537L15.0502 6.87507M13.4343 7.5H16.6667V4.16667L13.4343 7.5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowRotateRight
