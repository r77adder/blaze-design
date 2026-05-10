import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LinkAngled = forwardRef<SVGSVGElement, IconProps>(
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
          d="M6.14876 8.49212L4.28755 10.3533C3.59244 11.0484 3.1927 11.9942 3.20001 12.9883C3.20731 13.9823 3.5983 14.9338 4.32639 15.6394C5.03196 16.3676 5.98374 16.7585 6.97759 16.7658C7.99411 16.7733 8.91753 16.3961 9.61268 15.701L11.4739 13.8398M13.8512 11.5079L15.7125 9.64667C16.4076 8.95156 16.8073 8.00576 16.8 7.01174C16.7927 6.01773 16.4017 5.06616 15.6736 4.36055C14.9682 3.65515 14.0166 3.26414 13.0226 3.25683C12.0286 3.24953 11.0826 3.62657 10.3875 4.3217L8.52627 6.18291M7.17759 12.7726L12.7612 7.189"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default LinkAngled
