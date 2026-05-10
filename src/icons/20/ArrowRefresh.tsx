import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowRefresh = forwardRef<SVGSVGElement, IconProps>(
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
          d="M4.64822 6.04167C5.80651 3.92445 7.97144 2.5 10.451 2.5C13.2624 2.5 15.6693 4.33119 16.6631 6.92708M6.68283 6.92708H3.33333V3.38542M16.1851 13.125C15.0268 15.2422 12.8619 16.6667 10.3823 16.6667C7.57094 16.6667 5.16405 14.8355 4.17028 12.2396M14.1505 12.2396H17.5V15.7813"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowRefresh
