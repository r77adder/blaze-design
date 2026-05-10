import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const RatioPortrait = forwardRef<SVGSVGElement, IconProps>(
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
        <mask id="path-2-inside-1_2560_140" fill="white">
          <rect x="4.125" y="1.4375" height="17.125" width="12.25" rx="1"  />
        </mask>
        <rect
          x="4.125"
          y="1.4375"
          height="17.125"
          width="12.25"
          rx="1"
          
          stroke={color}
          strokeWidth="3"
          mask="url(#path-2-inside-1_2560_140)"
        />
      </svg>
    )
  },
)

export default RatioPortrait
