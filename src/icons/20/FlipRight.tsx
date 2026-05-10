import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FlipRight = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M14.2051 4L18 7.84624M18 7.84624L14.2051 11.6925M18 7.84624L6 7.84624C3.79086 7.84624 2 9.6371 2 11.8462L2 12C2 14.2091 3.79086 16 6 16L10 16"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default FlipRight
