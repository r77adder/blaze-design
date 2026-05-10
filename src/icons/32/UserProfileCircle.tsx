import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const UserProfileCircle = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 32 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <rect width="32" height="32" rx="16" fill="black" fillOpacity="0.04" />
        <path
          d="M9 21.9999C10.0588 20.2313 12.3795 19.0208 16 19.0208C19.6205 19.0208 21.9412 20.2313 23 21.9999M25.5999 15.9999C25.5999 21.3018 21.3018 25.5999 15.9999 25.5999C10.698 25.5999 6.3999 21.3018 6.3999 15.9999C6.3999 10.698 10.698 6.3999 15.9999 6.3999C21.3018 6.3999 25.5999 10.698 25.5999 15.9999ZM18.876 12.8799C18.876 14.4705 17.5884 15.7599 16 15.7599C14.4116 15.7599 13.124 14.4705 13.124 12.8799C13.124 11.2893 14.4116 9.99988 16 9.99988C17.5884 9.99988 18.876 11.2893 18.876 12.8799Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  },
)

export default UserProfileCircle
