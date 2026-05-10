import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Marker = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" ref={forwardedRef}>
    <path
      d="M2.5 17.5H6.59091M4.54545 10.3261V2.5H17.5L15.4545 6.41304L17.5 10.3261H4.54545ZM4.54545 10.3261V16.8478"
      stroke={color}
      strokeOpacity="0.9"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
))

export default Marker
