import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Calendar2 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, strokeWidth = 1.5 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M6.45833 14.8335V14.7619M10.6771 14.8335V14.7619M10.6771 10.9524V10.8808M14.4271 10.9524V10.8808M3.64583 6.66665H16.7708M5.34226 1.48809V2.50016M14.8958 1.48809V2.49999M14.8958 2.49999H5.52083C3.96753 2.49999 2.70833 3.77917 2.70833 5.35711V15.4762C2.70833 17.0542 3.96753 18.3333 5.52083 18.3333H14.8958C16.4491 18.3333 17.7083 17.0542 17.7083 15.4762L17.7083 5.35711C17.7083 3.77917 16.4491 2.49999 14.8958 2.49999Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default Calendar2
