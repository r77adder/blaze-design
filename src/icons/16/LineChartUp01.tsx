import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LineChartUp01 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16 }, forwardedRef) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path
          d="M1.59967 1.6001V14.4001H14.3997M4.79967 9.60018L7.59967 6.80018L9.59967 8.80018L13.9997 4.40018M11.0062 4.0001H14.4003V7.39421"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default LineChartUp01
