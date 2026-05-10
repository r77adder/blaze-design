import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowLeft = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M8.88856 15.8334L3.33301 10M3.33301 10L8.88856 4.16669M3.33301 10L16.6663 10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default ArrowLeft
