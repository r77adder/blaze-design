import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TextColor = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        opacity="0.98"
        d="M4.41167 17.0001C4.80725 17.0001 5.16204 16.7566 5.30441 16.3876L6.70679 12.752H13.2932L14.6955 16.3876C14.8379 16.7566 15.1927 17.0001 15.5883 17.0001V17.0001C16.2648 17.0001 16.7276 16.3172 16.477 15.6888L11.3953 2.94581C11.1676 2.37471 10.6148 2.00005 9.99997 2.00005V2.00005C9.38514 2.00005 8.83238 2.37471 8.60463 2.94581L3.52289 15.6888C3.2723 16.3172 3.73516 17.0001 4.41167 17.0001V17.0001ZM7.32724 11.1407L9.93633 4.3731H10.0636L12.6727 11.1407H7.32724Z"
        fill={color}
      />
    </svg>
  )
})

export default TextColor
