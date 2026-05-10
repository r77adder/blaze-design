import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Scheduled = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M3.33317 6.86935H9.1665M5.4041 1.66699V3.02429M14.4269 1.66699V3.02413M14.4269 3.02413H5.57275C4.10575 3.02413 2.9165 4.23935 2.9165 5.7384V14.7861C2.9165 16.2851 4.10575 17.5003 5.57275 17.5003H14.4269C15.8939 17.5003 17.0832 16.2851 17.0832 14.7861L17.0832 5.7384C17.0832 4.23935 15.8939 3.02413 14.4269 3.02413ZM7.08317 11.2503L9.58317 14.167L14.1665 6.66696"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Scheduled
