import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const UserProfile = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M16.9996 18L16.9999 15.0003C17 13.3433 15.6568 12 13.9999 12H6.00047C4.34375 12 3.00066 13.3429 3.00047 14.9997L3.00013 18M13.0001 5C13.0001 6.65685 11.657 8 10.0001 8C8.34328 8 7.00014 6.65685 7.00014 5C7.00014 3.34314 8.34328 2 10.0001 2C11.657 2 13.0001 3.34314 13.0001 5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default UserProfile
