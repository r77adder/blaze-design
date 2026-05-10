import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ClockCheck = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 25 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M15.4949 15.3438L11.9792 14.1719V9.27174M21.3543 13C21.3543 7.82233 17.1569 3.625 11.9792 3.625C6.80158 3.625 2.60425 7.82233 2.60425 13C2.60425 18.1777 6.80158 22.375 11.9792 22.375C12.5801 22.375 13.1677 22.3185 13.7371 22.2105M16.0808 19.4453L17.8386 21.2031L22.5261 16.5156"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ClockCheck
