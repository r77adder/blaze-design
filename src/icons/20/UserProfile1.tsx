import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const UserProfile = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13.3545 17.6231L13.3548 14.9449C13.3549 13.4656 12.1557 12.2663 10.6764 12.2663H4.67868C3.19957 12.2663 2.00047 13.4653 2.0003 14.9444L2 17.6231M17.9998 17.6232L18 14.9451C18.0001 13.4658 16.8009 12.2665 15.3216 12.2665M12.8386 3.86455C13.4964 4.35258 13.9226 5.13496 13.9226 6.0169C13.9226 6.89884 13.4964 7.68123 12.8386 8.16926M10.4115 6.01676C10.4115 7.49599 9.21235 8.69514 7.73312 8.69514C6.25389 8.69514 5.05474 7.49599 5.05474 6.01676C5.05474 4.53753 6.25389 3.33838 7.73312 3.33838C9.21235 3.33838 10.4115 4.53753 10.4115 6.01676Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default UserProfile
