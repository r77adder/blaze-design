import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const RightRail = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M5.53125 13.6325L2 10.0003L5.53125 6.36819"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="10" y="1.625" width="7.19995" height="16.4375" rx="1" stroke={color} strokeWidth="1.5" />
    </svg>
  )
})

export default RightRail
