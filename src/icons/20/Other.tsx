import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Other = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      ref={forwardedRef}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10ZM8 10C8 8.89543 8.89543 8 10 8C11.1046 8 12 8.89543 12 10C12 11.1046 11.1046 12 10 12C8.89543 12 8 11.1046 8 10ZM15 8C13.8954 8 13 8.89543 13 10C13 11.1046 13.8954 12 15 12C16.1046 12 17 11.1046 17 10C17 8.89543 16.1046 8 15 8Z"
        fill="url(#paint0_linear_3636_218)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3636_218"
          x1="10.5"
          y1="9.13642"
          x2="10.5"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2AB5F0" />
          <stop offset="1" stopColor="#0073A4" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Other
