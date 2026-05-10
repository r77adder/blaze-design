import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Checkbox = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <rect width="20" height="20" rx="2" fill={color} />
      <rect x="0.5" y="0.5" width="19" height="19" rx="1.5" stroke="white" strokeOpacity="0.26" />
    </svg>
  )
})

export default Checkbox
