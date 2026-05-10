import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ClockBackward = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M12.8125 11.5242L10 10.5867V6.66663"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.94337 10C2.94337 5.85787 6.30211 2.5 10.4453 2.5C14.5885 2.5 17.9473 5.85786 17.9473 10C17.9473 14.1421 14.5885 17.5 10.4453 17.5C7.66854 17.5 5.24412 15.9918 3.947 13.75M4.79264 9.16667L2.91715 11.0417L1.04167 9.16667"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ClockBackward
