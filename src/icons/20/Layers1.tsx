import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Layers1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
      <path d="M10 4L18 8.10062L10 12.2012L2 8.10062L10 4Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
})

export default Layers1
