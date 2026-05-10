import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Plus1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path d="M12 3L12 21M21 12L3 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
})

export default Plus1
