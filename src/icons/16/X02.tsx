import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const X02 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      ref={forwardedRef}
    >
      <path d="M18 6L6 18M18 18L6 6" stroke={color} strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
})

export default X02
