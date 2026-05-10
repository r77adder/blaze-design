import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AgencyPlanIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_3700_37758)">
          <path d="M15.8437 17.7424L15.8437 11.1426H4.15625V17.7424" stroke={color} strokeWidth="1.5" />
          <rect x="4.15625" y="5.36719" width="11.6875" height="5.77514" stroke={color} strokeWidth="1.5" />
          <rect x="5.33203" y="2.75342" width="9.33572" height="2.61377" stroke={color} strokeWidth="1.5" />
          <line x1="15.8438" y1="8.25635" x2="6.21875" y2="8.25635" stroke={color} strokeWidth="1.5" />
          <line x1="13.7188" y1="14.0322" x2="4.15623" y2="14.0322" stroke={color} strokeWidth="1.5" />
          <line x1="13.7188" y1="17.0005" x2="4.15623" y2="17.0005" stroke={color} strokeWidth="1.5" />
          <line x1="18.0312" y1="19.9185" x2="2.21834" y2="19.9185" stroke={color} strokeWidth="1.5" />
        </g>
        <defs>
          <clipPath id="clip0_3700_37758">
            <rect width="20" height="20" fill={color} transform="translate(0 0.960938)" />
          </clipPath>
        </defs>
      </svg>
    )
  },
)

export default AgencyPlanIcon
