import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const BarChartSquareUp01 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16 }, forwardedRef) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size + 1} viewBox="0 0 16 17" fill="none">
        <path
          d="M2.4001 10.9L4.9666 8.50001L6.79982 10.2143L10.8329 6.4429M8.08902 6.09997H11.2001V9.00917M3.2001 14.9C2.31644 14.9 1.6001 14.1836 1.6001 13.3V3.69998C1.6001 2.81632 2.31644 2.09998 3.2001 2.09998H12.8001C13.6838 2.09998 14.4001 2.81632 14.4001 3.69998V13.3C14.4001 14.1836 13.6838 14.9 12.8001 14.9H3.2001Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default BarChartSquareUp01
