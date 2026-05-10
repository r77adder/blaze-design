import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Upload = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M13.2357 14.3751H14.375C16.3084 14.3751 17.6563 12.9838 17.6563 11.25C17.6563 9.84758 16.7661 8.4856 15.4516 8.16777C15.4067 7.01874 14.8967 6.1607 14.1926 5.70813C13.5021 5.26425 12.6494 5.21033 11.8969 5.54942C11.2936 4.38376 10.1044 3.43774 8.54145 3.43774C6.21651 3.43774 4.5779 5.61334 4.69639 7.83225C3.34714 8.19246 2.34375 9.50049 2.34375 11.0548C2.34375 12.8863 3.73334 14.3751 5.44268 14.3751H6.71875"
        stroke={color}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 8.90649V16.5627M10 8.90649L7.26562 11.6409M10 8.90649L12.7344 11.6409"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Upload
