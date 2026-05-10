import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Marker03 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
      <g transform="translate(0,-2)">
        <path
          d="M10 18.333C13.333 15 15 12.222 15 10A5 5 0 0 0 10 5a5 5 0 0 0-5 5c0 2.222 1.667 5 5 8.333Z"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="2.0" stroke={color} strokeOpacity="0.8" strokeWidth="1.5" />
      </g>
    </svg>
  )
})

export default Marker03
