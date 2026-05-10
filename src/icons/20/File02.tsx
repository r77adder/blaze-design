import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const File02 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, strokeWidth = 1.5 }, forwardedRef) => {
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
          d="M7.00018 6H13.0002M7.00018 9H13.0002M7.00018 12H10.0002M5.49995 2H14.5001C15.6047 2 16.5002 2.89546 16.5001 4.00004L16.4999 16C16.4999 17.1046 15.6044 18 14.4999 18L5.49986 18C4.39529 18 3.49986 17.1045 3.49987 15.9999L3.49995 3.99999C3.49995 2.89543 4.39538 2 5.49995 2Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default File02
