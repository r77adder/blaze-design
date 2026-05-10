import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CloseThick = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path d="M12 4.5L4 12.5M12 12.5L4 4.5" stroke="#0099F7" strokeWidth="1.5" strokeLinecap="round" fill={color} />
      </svg>
    )
  },
)

export default CloseThick
