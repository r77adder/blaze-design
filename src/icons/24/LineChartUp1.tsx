import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LineChartUp1 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        ref={forwardedRef}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M2.39954 2.3999V21.5999H21.5995M7.19954 14.4L11.3995 10.2L14.3995 13.2L20.9995 6.60003M16.5093 5.9999H21.6004V11.0911"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default LineChartUp1
