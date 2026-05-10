import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CalendarCheck = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M3.33317 6.86904H17.0832M5.4041 1.66669V3.02399M14.4269 1.66669V3.02382M14.4269 3.02382H5.57275C4.10575 3.02382 2.9165 4.23904 2.9165 5.73809V14.7857C2.9165 16.2848 4.10575 17.5 5.57275 17.5H14.4269C15.8939 17.5 17.0832 16.2848 17.0832 14.7857L17.0832 5.73809C17.0832 4.23904 15.8939 3.02382 14.4269 3.02382ZM7.7863 12.2976L9.11442 13.6548L12.2134 10.4881"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CalendarCheck
