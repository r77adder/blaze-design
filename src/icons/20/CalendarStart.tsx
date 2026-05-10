import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CalendarStart = forwardRef<SVGSVGElement, IconProps>(
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
          d="M17.2917 7.33796V6.57141C17.2917 5.07236 16.1385 3.85714 14.7159 3.85714H6.13005M17.2917 7.33796V15.6191C17.2917 17.1181 16.1385 18.3333 14.7159 18.3333H13.8573M17.2917 7.33796H3.55429M6.13005 3.85714V2.5M6.13005 3.85714C4.7075 3.85714 3.55429 5.07236 3.55429 6.57141V7.33796M14.8794 2.5V3.8573M3.55429 10.4167V7.33796M3.125 14.2996H12.5694M12.5694 14.2996L8.77939 10.4167M12.5694 14.2996L8.77939 18.1826"
          stroke={color}
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CalendarStart
