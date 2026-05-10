import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Check = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M4 8.43233C4.79279 9.0089 6.37838 10.5945 7.02703 11.6756C7.81982 9.94584 9.83784 6.05395 12 4.32422"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Check
