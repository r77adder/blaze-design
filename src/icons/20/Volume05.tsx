import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Volume05 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M17.6824 3.07941C19.2661 5.59385 19.4898 8.94044 17.9833 11.9018M14.3459 4.72406C15.6827 6.28659 15.8715 8.36621 14.5999 10.2065M10 1L5.58775 4.4884H1V9.51111L5.58775 9.50985L10 13V1Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Volume05
