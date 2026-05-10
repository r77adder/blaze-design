import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ChartMiddle = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M2 18V16.2222M12.6667 18V7.33333M18 18V2"
          stroke="black"
          strokeOpacity="0.08"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M2 18V16.2222" stroke="#E0AF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.33398 18V11.7778" stroke="#E0AF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
)

export default ChartMiddle
