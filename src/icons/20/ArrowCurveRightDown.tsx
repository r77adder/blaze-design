import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowCurveRightDown = forwardRef<SVGSVGElement, IconProps>(
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
        <path
          d="M13.0717 16.5L17.5 12.0717M17.5 12.0717L13.0717 7.64332M17.5 12.0717H7.5C5.29086 12.0717 3.5 10.2808 3.5 8.07166V3.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowCurveRightDown
