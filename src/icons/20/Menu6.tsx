import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Menu6 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M14.5833 14.1667H5.41667M11.5625 10H5.41667M14.5833 5.83333H5.41667"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.00008 4.99992C2.00008 3.34306 3.34323 1.99992 5.00008 1.99992H15.0001C16.6569 1.99992 18.0001 3.34306 18.0001 4.99992V14.9999C18.0001 16.6568 16.6569 17.9999 15.0001 17.9999H5.00008C3.34323 17.9999 2.00008 16.6568 2.00008 14.9999V4.99992Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Menu6
