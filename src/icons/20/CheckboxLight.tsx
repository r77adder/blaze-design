import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CheckboxLight = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <rect x="0.859375" width="20" height="20" rx="4" fill="white" />
        <rect x="1.35938" y="0.5" width="19" height="19" rx="3.5" stroke="black" strokeOpacity="0.4" />
      </svg>
    )
  },
)

export default CheckboxLight
