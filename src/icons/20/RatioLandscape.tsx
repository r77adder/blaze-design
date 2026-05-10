import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const RatioLandscape = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <mask id="path-1-inside-1_2251_3853" fill="white">
          <rect x="1.4375" y="4.625" width="17.125" height="10.75" rx="1" />
        </mask>
        <rect
          x="1.4375"
          y="4.625"
          width="17.125"
          height="10.75"
          rx="1"
          stroke={color}
          strokeWidth="3"
          mask="url(#path-1-inside-1_2251_3853)"
        />
      </svg>
    )
  },
)

export default RatioLandscape
