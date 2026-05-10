import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ChartLow = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M2.5 18V16.2222M7.83333 18V11.7778M13.1667 18V7.33333M18.5 18V2"
        stroke={color}
        strokeOpacity="0.08"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.5 18V16.2222" stroke="#FF842B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
})

export default ChartLow
