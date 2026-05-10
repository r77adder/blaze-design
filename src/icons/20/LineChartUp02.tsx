import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LineChartUp02 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M1.3999 1.39999V20.6H20.5999M6.1999 13.4001L10.3999 9.20012L13.3999 12.2001L18.8 6.79999"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default LineChartUp02
