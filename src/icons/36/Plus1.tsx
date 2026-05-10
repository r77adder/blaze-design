import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Plus1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 36 }, forwardedRef) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path d="M18 6L18 30M30 18L6 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
})

export default Plus1
