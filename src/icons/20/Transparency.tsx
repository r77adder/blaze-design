import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Transparency = forwardRef<SVGSVGElement, IconProps>(
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
        <rect x="1.25" y="1.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.5" x="6.25" y="1.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.3" x="11.25" y="1.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.1" x="16.25" y="1.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.7" x="3.75" y="3.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.5" x="6.25" y="6.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.4" x="8.75" y="3.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.2" x="13.75" y="3.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect x="1.25" y="6.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.3" x="11.25" y="6.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.1" x="16.25" y="6.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.7" x="3.75" y="8.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.4" x="8.75" y="8.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.2" x="13.75" y="8.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.5" x="6.25" y="11.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect x="1.25" y="11.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.3" x="11.25" y="11.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.1" x="16.25" y="11.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.5" x="6.25" y="16.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.7" x="3.75" y="13.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.4" x="8.75" y="13.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.2" x="13.75" y="13.75" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect x="1.25" y="16.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.3" x="11.25" y="16.25" width="2.5" height="2.5" rx="0.5" fill={color} />
        <rect opacity="0.1" x="16.25" y="16.25" width="2.5" height="2.5" rx="0.5" fill={color} />
      </svg>
    )
  },
)

export default Transparency
