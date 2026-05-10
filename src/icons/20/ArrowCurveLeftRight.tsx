import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowCurveLeftRight = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.5717 16.5L17 12.0717M17 12.0717L12.5717 7.64332M17 12.0717H7C4.79086 12.0717 3 10.2808 3 8.07166V3.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowCurveLeftRight
