import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Plus = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path d="M10 4L10 16M16 10L4 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
})

export default Plus
