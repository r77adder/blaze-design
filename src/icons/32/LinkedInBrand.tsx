import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LinkedInBrand = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 32, ...rest }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
        {...rest}
      >
        <rect width="32" height="32" rx="5" fill="#1275B1" />
        <path d="M7.16037 24.8048H10.9597V10.8738H7.16037V24.8048Z" fill="white" />
        <path
          d="M6.84375 7.03384C6.84375 8.26737 7.83666 9.26788 9.06006 9.26788C10.2847 9.26788 11.2764 8.26737 11.2764 7.03384C11.2764 5.80031 10.2835 4.7998 9.06006 4.7998C7.83666 4.7998 6.84375 5.80031 6.84375 7.03384Z"
          fill="white"
        />
        <path
          d="M22.3579 24.8048H26.1573V16.2448C26.1573 9.59209 19.06 9.83399 17.2921 13.1091V10.8738H13.4927V24.8048H17.2921V17.7076C17.2921 13.7651 22.3579 13.4421 22.3579 17.7076V24.8048Z"
          fill="white"
        />
      </svg>
    )
  },
)

export default LinkedInBrand
