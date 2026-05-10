import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CalendarCheckFilled = forwardRef<SVGSVGElement, IconProps>(
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
          d="M5.57275 17.5C4.10575 17.5 2.9165 16.2847 2.9165 14.7857V5.73803C2.9165 4.23898 4.10575 3.02376 5.57275 3.02376H14.4269C15.8939 3.02376 17.0832 4.23898 17.0832 5.73803L17.0832 14.7857C17.0832 16.2847 15.8939 17.5 14.4269 17.5H5.57275Z"
          fill="white"
        />
        <path
          d="M3.33317 6.86898H17.0832M5.4041 1.66663V3.02393M14.4269 1.66663V3.02376M14.4269 3.02376H5.57275C4.10575 3.02376 2.9165 4.23898 2.9165 5.73803V14.7857C2.9165 16.2847 4.10575 17.5 5.57275 17.5H14.4269C15.8939 17.5 17.0832 16.2847 17.0832 14.7857L17.0832 5.73803C17.0832 4.23898 15.8939 3.02376 14.4269 3.02376ZM7.7863 12.2976L9.11442 13.6547L12.2134 10.488"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CalendarCheckFilled
