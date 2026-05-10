import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowExpand4 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M11.8389 3.33301H16.6668M16.6668 3.33301V8.1606M16.6668 3.33301L11.0343 8.9652M8.1614 16.6663H3.3335M3.3335 16.6663V11.8388M3.3335 16.6663L8.96605 11.0342"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowExpand4
