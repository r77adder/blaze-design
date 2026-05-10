import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FlipLeft = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M5.79489 4L2 7.84624M2 7.84624L5.79489 11.6925M2 7.84624L14 7.84624C16.2091 7.84624 18 9.6371 18 11.8462L18 12C18 14.2091 16.2091 16 14 16L10 16"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default FlipLeft
