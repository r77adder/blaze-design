import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const InsertRight = forwardRef<SVGSVGElement, IconProps>(
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
          d="M14.0573 12.0172L17.3125 15.4352M17.3125 15.4352L14.0573 18.8531M17.3125 15.4352H2.625M9.96875 3.34143L9.96875 11.9039M14.25 7.62268L5.6875 7.62268"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default InsertRight
