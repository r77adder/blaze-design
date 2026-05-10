import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Upload5 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M13.2357 14.3748H14.375C16.3084 14.3748 17.6563 12.9836 17.6563 11.2498C17.6563 9.84734 16.7661 8.48536 15.4516 8.16752C15.4067 7.0185 14.8967 6.16045 14.1926 5.70789C13.5021 5.26401 12.6494 5.21009 11.8969 5.54917C11.2936 4.38351 10.1044 3.4375 8.54145 3.4375C6.21651 3.4375 4.5779 5.61309 4.69639 7.83201C3.34714 8.19222 2.34375 9.50024 2.34375 11.0546C2.34375 12.886 3.73334 14.3748 5.44268 14.3748H6.71875"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 8.90625V16.5625M10 8.90625L7.26562 11.6406M10 8.90625L12.7344 11.6406"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Upload5
