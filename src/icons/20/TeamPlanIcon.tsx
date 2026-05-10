import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TeamPlanIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_3700_9710)">
          <path
            d="M2.04395 19.4001C3.97944 17.7055 6.83582 16.6338 10.0219 16.6338C13.2079 16.6338 16.0643 17.7055 17.9998 19.4001"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10.0889 16.6001C10.0889 11.6747 14.2138 8.13175 17.25 7.08594C17.25 10.1484 15.125 14.0234 11.472 12.2145"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.0558 16.5328C10.0879 14.4123 9.52337 12.0046 8.25 10.2111M8.25 10.2111C5.9553 11.2569 1.97514 8.9291 2.4813 3.43017C7.87963 3.43017 10.6446 7.64714 8.25 10.2111ZM8.25 10.2111C6.76489 8.11944 6.49796 7.65673 5.25 6.27356"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_3700_9710">
            <rect width="20" height="20" fill={color} transform="translate(0 0.960938)" />
          </clipPath>
        </defs>
      </svg>
    )
  },
)

export default TeamPlanIcon
