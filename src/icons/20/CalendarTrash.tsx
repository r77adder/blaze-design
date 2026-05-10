import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CalendarTrash = forwardRef<SVGSVGElement, IconProps>(
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
          d="M3.75 7.08333V6.35712C3.75 4.93697 4.86929 3.78571 6.25 3.78571H14.5833M3.75 7.08333V14.9286C3.75 16.3487 4.86929 17.5 6.25 17.5H6.66667M3.75 7.08333H17.0833M14.5833 3.78571V2.5M14.5833 3.78571C15.964 3.78571 17.0833 4.93697 17.0833 6.35712V7.08333M6.09127 2.5V3.78586M17.0833 7.91667V7.08333M15.6624 10.5337L12.5032 13.6929M12.5032 13.6929L9.34401 16.8521M12.5032 13.6929L15.5972 16.7869M12.5032 13.6929L9.40921 10.5989"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CalendarTrash
