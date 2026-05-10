import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Filter = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M4.30753 8.00033H11.6921M2.6665 4.66699H13.3332M6.76907 11.3337H9.23061"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Filter
