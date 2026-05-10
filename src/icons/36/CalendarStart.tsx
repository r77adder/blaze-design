import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CalendarStart = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 36 }, forwardedRef) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36" fill="none">
        <path
          d="M30.75 12.75V11.4428C30.75 8.88655 28.7353 6.81427 26.25 6.81427H11.25M30.75 12.75V26.8715C30.75 29.4277 28.7353 31.5 26.25 31.5H24.75M30.75 12.75H6.75M11.25 6.81427V4.5M11.25 6.81427C8.76472 6.81427 6.75 8.88654 6.75 11.4428V12.75M26.5357 4.5V6.81456M6.75 18V12.75"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 24.6215H22.5M22.5 24.6215L15.8785 18M22.5 24.6215L15.8785 31.2429"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CalendarStart
