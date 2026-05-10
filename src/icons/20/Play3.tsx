import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Play3 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, fill = 'none' }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill={fill}
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M15.8077 9.11445C16.9465 9.74903 16.9506 10.5473 15.8077 11.2647L6.97692 17.2205C5.86734 17.8126 5.11374 17.463 5.03463 16.1817L4.99716 3.71652C4.97218 2.53629 5.94436 2.20283 6.87075 2.7687L15.8077 9.11445Z"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
        />
      </svg>
    )
  },
)

export default Play3
