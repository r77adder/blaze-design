import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const BarChart = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 21 20" fill="none">
      <path
        d="M2.3999 17.25V6.58333M7.73324 17.25V11.0278M13.0666 17.25V2.75M18.3999 17.25V6.58333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default BarChart
