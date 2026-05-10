import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const VolumeOn = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, fill = 'none' }, forwardedRef) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill={fill}
        ref={forwardedRef}
      >
        <path
          d="M18.0729 7.08846L15.1563 9.93109M15.1563 9.93109L12.2398 12.7737M15.1563 9.93109L18.0729 12.7737M15.1563 9.93109L12.2398 7.08846M10 3.33337L5.27262 7.20938H2.5V12.7902L5.27262 12.7888L10 16.6667V3.33337Z"
          stroke={color}
        />
      </svg>
    )
  },
)

export default VolumeOn
