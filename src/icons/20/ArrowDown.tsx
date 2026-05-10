import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowDown = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M15.8332 11.1108L9.99984 16.6663M9.99984 16.6663L4.1665 11.1108M9.99984 16.6663L9.99984 3.33301"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default ArrowDown
