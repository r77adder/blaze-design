import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Minimise02 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
      <path
        d="M16.667 3.333l-5.834 5.834M16.667 3.333h-5M16.667 3.333v5M3.333 16.667l5.834-5.834M3.333 16.667h5M3.333 16.667v-5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Minimise02
