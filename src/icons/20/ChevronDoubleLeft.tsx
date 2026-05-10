import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Left = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M8.83325 14.3488L4.16658 9.68211L8.83325 5.01544M15.8333 14.3488L11.1666 9.68211L15.8333 5.01544"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Left
