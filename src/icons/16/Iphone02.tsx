import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Iphone02 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16, strokeWidth = 1.5 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.11771 3.79443H9.33993M4.22882 3.4611V13.4611C4.22882 14.3816 4.82577 15.1278 5.56215 15.1278H10.8955C11.6319 15.1278 12.2288 14.3816 12.2288 13.4611V3.46111C12.2288 2.54064 11.6319 1.79444 10.8955 1.79444L5.56216 1.79443C4.82578 1.79443 4.22882 2.54062 4.22882 3.4611Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default Iphone02
