import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Download = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M3.33333 12.6703L3.33333 15.7438C3.33333 16.2095 3.50893 16.6562 3.82149 16.9856C4.13405 17.315 4.55797 17.5 5 17.5H15C15.442 17.5 15.8659 17.315 16.1785 16.9856C16.4911 16.6562 16.6667 16.2095 16.6667 15.7438V12.6703M10.0009 2.5V12.4521M10.0009 12.4521L13.8105 8.64941M10.0009 12.4521L6.19141 8.64941"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Download
