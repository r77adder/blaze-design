import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowDownRightSm = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M12 5.22353L11.9059 11.9059M11.9059 11.9059L5.22353 12M11.9059 11.9059L4 4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowDownRightSm
