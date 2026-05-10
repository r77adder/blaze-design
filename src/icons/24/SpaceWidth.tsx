import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const SpaceWidth = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M21.5999 2.40002V21.6M2.3999 2.40002V21.6M15.5693 9.60002L17.9999 12M17.9999 12L15.5693 14.4M17.9999 12H5.9999M8.43046 14.4L5.9999 12M5.9999 12L8.43046 9.60002"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default SpaceWidth
