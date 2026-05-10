import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Stop = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
      <rect x="4" y="4" width="12" height="12" rx="1" fill={color} />
    </svg>
  )
})

export default Stop
