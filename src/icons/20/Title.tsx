import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Title = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M6.94454 17.2H10.2118M10.2118 17.2H13.6303M10.2118 17.2V2.8M10.2118 2.8H4.8874C4.31933 2.8 3.85883 3.26051 3.85883 3.82857V7.10492M10.2118 2.8H15.1126C15.6807 2.8 16.1412 3.26051 16.1412 3.82857V7.10492"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Title
