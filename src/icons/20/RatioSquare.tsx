import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const RatioSquare = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <mask id="path-1-inside-1_2251_27726" fill="white">
        <rect x="2.5" y="2.5" width="15" height="15" rx="1" />
      </mask>
      <rect
        x="2.5"
        y="2.5"
        width="15"
        height="15"
        rx="1"
        stroke={color}
        strokeWidth="3"
        mask="url(#path-1-inside-1_2251_27726)"
      />
    </svg>
  )
})

export default RatioSquare
