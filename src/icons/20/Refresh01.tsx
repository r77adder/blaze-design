import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Refresh01 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M4.84679 18L2 15M2 15L4.84679 12M2 15H16C17.1046 15 18 14.1046 18 13V10M15.1532 2L18 5M18 5L15.1532 8M18 5H4C2.89543 5 2 5.89543 2 7V10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Refresh01
